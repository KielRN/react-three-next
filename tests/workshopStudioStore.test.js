import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'

const state = vi.hoisted(() => ({ db: null, failEvent: false }))
vi.mock('../lib/db.js', () => ({
  query: (...args) => state.db.query(...args),
  transaction: (work) => state.db.transaction((client) => work({
    query: (...args) => {
      if (state.failEvent && /insert into workshop_studio_events/i.test(args[0])) {
        state.failEvent = false
        throw new Error('Simulated audit write failure')
      }
      return client.query(...args)
    },
  })),
}))
import * as store from '../lib/workshopStudioStore.js'

const NOW = new Date('2026-11-06T17:00:00Z')
const hash = (value = 'approved shot') => createHash('sha256').update(value).digest('hex')
let cohortId
let seatId

async function seat() {
  const id = randomUUID()
  await state.db.query(`insert into workshop_studio_seats
    (id, cohort_id, ghl_calendar_id, ghl_registration_id, ghl_contact_id, registration_state)
    values ($1, $2, 'video-calendar', $3, $4, 'eligible')`, [id, cohortId, randomUUID(), randomUUID()])
  return id
}
const reserve = (changes = {}) => store.reserveGeneration({
  seatId, accessVersion: 1, requestKey: randomUUID(), requestHash: hash(), maximumCostCents: 200, currency: 'USD', now: NOW, ...changes,
})
const reconcile = (job, changes = {}) => store.reconcileGeneration({
  jobId: job.id, outcome: 'charged', actualCostCents: 150, currency: 'USD',
  evidenceReference: 'billing-record-1', now: NOW, ...changes,
})
async function scalar(sql, params = []) { return Object.values((await state.db.query(sql, params)).rows[0])[0] }

beforeAll(async () => {
  state.db = new PGlite()
  const migration = readFileSync(new URL('../db/migrations/006_workshop_studio.sql', import.meta.url), 'utf8')
  await state.db.exec(migration)
  await state.db.exec(migration) // Safe migration retry must preserve data and constraints.
  await state.db.exec(readFileSync(new URL('../db/migrations/007_workshop_studio_access.sql', import.meta.url), 'utf8'))
  await state.db.exec(readFileSync(new URL('../db/migrations/008_workshop_studio_submission.sql', import.meta.url), 'utf8'))
}, 30000)
beforeEach(async () => {
  state.failEvent = false
  await state.db.exec('truncate workshop_studio_cohorts cascade')
  cohortId = randomUUID()
  await state.db.query(`insert into workshop_studio_cohorts
    (id, workshop_slug, session_starts_at, session_ends_at, access_opens_at, access_expires_at, paused)
    values ($1, 'ai-video-editing', '2026-11-06T17:00:00Z', '2026-11-06T19:00:00Z',
      '2026-11-05T17:00:00Z', '2026-11-13T19:00:00Z', false)`, [cohortId])
  seatId = await seat()
})
afterAll(async () => { await state.db?.close() })

describe('studio allowance ledger in PostgreSQL', () => {
  it.each([undefined, null, 0, -1, 1.5, '1'])('requires an explicit valid session epoch: %s', async (accessVersion) => {
    await expect(reserve({ accessVersion })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(0)
  })
  it('rejects stale session versions and cached jobs owned before transfer', async () => {
    const requestKey = randomUUID()
    await reserve({ requestKey, accessVersion: 1 })
    await store.transferStudioSeat({ seatId, ghlContactId: 'replacement', ghlRegistrationId: 'replacement', evidenceReference: 'verified-transfer', now: NOW })
    await expect(reserve({ accessVersion: 1 })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    await expect(reserve({ requestKey, accessVersion: 2 })).rejects.toMatchObject({ code: 'REQUEST_CONFLICT' })
  })
  it('claims submission only once and retains an unknown hold before any external POST', async () => {
    const job = await reserve()
    const args = { seatId, jobId: job.id, accessVersion: 1, now: NOW }
    const results = await Promise.all([store.claimGenerationSubmission(args), store.claimGenerationSubmission(args)])
    expect(results.filter((r) => r.claimed)).toHaveLength(1)
    expect((await store.getGeneration({ seatId, jobId: job.id })).state).toBe('unknown')
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(200)
    await state.db.exec(readFileSync(new URL('../db/migrations/008_workshop_studio_submission.sql', import.meta.url), 'utf8'))
    expect((await store.claimGenerationSubmission(args)).claimed).toBe(false)
  })
  it('cannot claim another seat or a transferred learner job', async () => {
    const job = await reserve()
    await expect(store.claimGenerationSubmission({ seatId: await seat(), jobId: job.id, accessVersion: 1, now: NOW })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await store.transferStudioSeat({ seatId, ghlContactId: 'replacement', ghlRegistrationId: 'replacement', evidenceReference: 'verified-transfer', now: NOW })
    await expect(store.claimGenerationSubmission({ seatId, jobId: job.id, accessVersion: 2, now: NOW })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
  })
  it('enforces the learner cap against both held and settled cost', async () => {
    const first = await reserve({ maximumCostCents: 400 })
    expect(await store.getStudioUsage({ seatId })).toMatchObject({
      seat: { limitCents: 500, heldCents: 400, spentCents: 0, availableCents: 100 },
      cohort: { limitCents: 6000, heldCents: 400, spentCents: 0, availableCents: 5600 },
    })
    await expect(reserve()).rejects.toMatchObject({ code: 'LEARNER_LIMIT' })
    await reconcile(first, { actualCostCents: 350 })
    await reserve({ maximumCostCents: 150 })
    await expect(reserve({ maximumCostCents: 1 })).rejects.toMatchObject({ code: 'LEARNER_LIMIT' })
  })

  it('permits only one outstanding job per seat, even when allowance remains', async () => {
    await reserve({ maximumCostCents: 100 })
    await expect(reserve({ maximumCostCents: 100 })).rejects.toMatchObject({ code: 'JOB_PENDING' })
  })

  it('atomically enforces the shared cohort cap across simultaneous learners', async () => {
    // Exercise the independent cohort boundary with a smaller synthetic budget.
    await state.db.query('update workshop_studio_cohorts set limit_cents = 500 where id = $1', [cohortId])
    const otherSeat = await seat()
    const results = await Promise.allSettled([
      reserve({ maximumCostCents: 400 }), reserve({ seatId: otherSeat, maximumCostCents: 400 }),
    ])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(results.find((r) => r.status === 'rejected').reason).toMatchObject({ code: 'COHORT_LIMIT' })
    expect((await store.getStudioUsage({ seatId })).cohort.heldCents).toBe(400)
  })

  it('reuses the same request without double holding, including concurrent retries', async () => {
    const requestKey = randomUUID()
    const jobs = await Promise.all([reserve({ requestKey }), reserve({ requestKey }), reserve({ requestKey })])
    expect(new Set(jobs.map((job) => job.id)).size).toBe(1)
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(1)
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(200)
    expect(await scalar('select count(*)::int from workshop_studio_events')).toBe(1)
    await expect(reserve({ requestKey, requestHash: hash('different shot') })).rejects.toMatchObject({ code: 'REQUEST_CONFLICT' })
    await expect(reserve({ requestKey, maximumCostCents: 201 })).rejects.toMatchObject({ code: 'REQUEST_CONFLICT' })
  })

  it('scopes idempotency and status lookup to the seat', async () => {
    const requestKey = randomUUID()
    const first = await reserve({ requestKey })
    const otherSeat = await seat()
    expect((await reserve({ seatId: otherSeat, requestKey })).id).not.toBe(first.id)
    expect(await store.getGeneration({ seatId: otherSeat, jobId: first.id })).toBeNull()
    expect(await store.getGeneration({ seatId, jobId: first.id })).toMatchObject({ id: first.id, state: 'reserved' })
  })

  it.each([
    ['cohort pause', 'update workshop_studio_cohorts set paused = true where id = $1', () => cohortId, 'ACCESS_PAUSED'],
    ['seat pause', 'update workshop_studio_seats set paused = true where id = $1', () => seatId, 'ACCESS_PAUSED'],
    ['revocation', 'update workshop_studio_seats set revoked_at = now() where id = $1', () => seatId, 'ACCESS_REVOKED'],
    ['cancelled registration', "update workshop_studio_seats set registration_state = 'cancelled' where id = $1", () => seatId, 'REGISTRATION_INELIGIBLE'],
    ['refunded registration', "update workshop_studio_seats set registration_state = 'refunded' where id = $1", () => seatId, 'REGISTRATION_INELIGIBLE'],
  ])('prevents reservations after %s without losing existing holds', async (_, sql, id, code) => {
    await reserve()
    await state.db.query(sql, [id()])
    await expect(reserve()).rejects.toMatchObject({ code })
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(200)
  })

  it.each(['2026-11-05T16:59:59Z', '2026-11-13T19:00:00Z', '2026-11-14T17:00:00Z'])(
    'rejects reservations outside the exact access window: %s', async (time) => {
      await expect(reserve({ now: new Date(time) })).rejects.toMatchObject({ code: 'ACCESS_CLOSED' })
    },
  )

  it.each([-1, 0, 0.5, NaN, Infinity, null, undefined, '200', Number.MAX_SAFE_INTEGER + 1])(
    'rejects an invalid or unbounded cost: %s', async (maximumCostCents) => {
      await expect(reserve({ maximumCostCents })).rejects.toMatchObject({ code: 'INVALID_QUOTE' })
      expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(0)
    },
  )

  it('rejects wrong currency, malformed identity/hash/key and invalid time', async () => {
    for (const changes of [{ currency: 'EUR' }, { seatId: 'bad' }, { requestHash: 'plain prompt' }, { requestKey: '' }, { now: new Date('invalid') }]) {
      await expect(reserve(changes)).rejects.toMatchObject({ code: expect.any(String) })
    }
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(0)
  })

  it('retains a timeout hold until billing proves an uncharged failure', async () => {
    const job = await reserve()
    await store.markGenerationSubmitted({ jobId: job.id, providerJobId: 'provider-job-1', now: NOW })
    await store.markGenerationUnknown({ jobId: job.id, now: NOW })
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(200)
    await expect(reserve({ maximumCostCents: 100 })).rejects.toMatchObject({ code: 'JOB_PENDING' })
    await expect(reconcile(job, { outcome: 'uncharged', actualCostCents: 0, evidenceReference: '' })).rejects.toMatchObject({ code: 'BILLING_EVIDENCE_REQUIRED' })
    await reconcile(job, { outcome: 'uncharged', actualCostCents: 0 })
    expect((await store.getStudioUsage({ seatId })).seat).toMatchObject({ spentCents: 0, heldCents: 0, availableCents: 500 })
    const retry = await reserve()
    expect(retry.id).not.toBe(job.id)
  })

  it('binds one provider correlation ID, and reconciles idempotently after access expires', async () => {
    const job = await reserve()
    await store.markGenerationSubmitted({ jobId: job.id, providerJobId: 'provider-job-1', now: NOW })
    await store.markGenerationSubmitted({ jobId: job.id, providerJobId: 'provider-job-1', now: NOW })
    await expect(store.markGenerationSubmitted({ jobId: job.id, providerJobId: 'different', now: NOW })).rejects.toMatchObject({ code: 'PROVIDER_CONFLICT' })
    await state.db.query('update workshop_studio_seats set revoked_at = now() where id = $1', [seatId])
    await reconcile(job, { now: new Date('2026-11-20T00:00:00Z') })
    const events = await scalar('select count(*)::int from workshop_studio_events')
    await reconcile(job)
    expect(await scalar('select count(*)::int from workshop_studio_events')).toBe(events)
    expect((await store.getStudioUsage({ seatId })).seat).toMatchObject({ spentCents: 150, heldCents: 0, availableCents: 350 })
    await store.markGenerationUnknown({ jobId: job.id, now: NOW })
    expect((await store.getGeneration({ seatId, jobId: job.id })).state).toBe('settled')
  })

  it('records and pauses an unexpected charge above the reserved amount', async () => {
    const job = await reserve()
    const result = await reconcile(job, { actualCostCents: 700 })
    expect(result).toMatchObject({ state: 'settled', actualCostCents: 700, incident: true })
    expect((await store.getStudioUsage({ seatId })).seat).toMatchObject({ spentCents: 700, heldCents: 0, availableCents: 0 })
    expect(await scalar('select paused from workshop_studio_cohorts where id = $1', [cohortId])).toBe(true)
    expect(await scalar("select count(*)::int from workshop_studio_events where kind = 'billing_incident'")).toBe(1)
    await expect(reserve()).rejects.toMatchObject({ code: 'ACCESS_PAUSED' })
  })

  it('records a late charge after a supposedly uncharged failure instead of hiding it', async () => {
    const job = await reserve()
    await reconcile(job, { outcome: 'uncharged', actualCostCents: 0 })
    await reconcile(job, { actualCostCents: 180, evidenceReference: 'late-provider-invoice' })
    expect((await store.getStudioUsage({ seatId })).seat.spentCents).toBe(180)
    expect(await scalar('select paused from workshop_studio_cohorts where id = $1', [cohortId])).toBe(true)
    // An older zero-cost notification must not restore money after that charge.
    await expect(reconcile(job, { outcome: 'uncharged', actualCostCents: 0 })).rejects.toMatchObject({ code: 'RECONCILIATION_CONFLICT' })
    expect((await store.getStudioUsage({ seatId })).seat.spentCents).toBe(180)
  })

  it('records a verified higher final charge after earlier settlement without accepting stale decreases', async () => {
    const job = await reserve()
    await reconcile(job)
    expect(await reconcile(job, { actualCostCents: 700, evidenceReference: 'corrected-provider-invoice' }))
      .toMatchObject({ actualCostCents: 700, incident: true, state: 'settled' })
    expect((await store.getStudioUsage({ seatId })).seat).toMatchObject({ spentCents: 700, heldCents: 0, availableCents: 0 })
    expect(await scalar('select paused from workshop_studio_cohorts where id = $1', [cohortId])).toBe(true)
    await expect(reconcile(job)).rejects.toMatchObject({ code: 'RECONCILIATION_CONFLICT' })
    expect((await store.getGeneration({ seatId, jobId: job.id })).actualCostCents).toBe(700)
  })

  it('rolls back the whole reservation after a database failure and allows a safe retry', async () => {
    const requestKey = randomUUID()
    state.failEvent = true
    await expect(reserve({ requestKey })).rejects.toThrow('Simulated audit write failure')
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(0)
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(0)
    await reserve({ requestKey })
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(200)
  })

  it('retains spent and held amounts and invalidates old sessions when a seat transfers', async () => {
    const first = await reserve()
    await reconcile(first)
    const pending = await reserve({ maximumCostCents: 300 })
    const before = await store.getStudioUsage({ seatId })
    await store.transferStudioSeat({ seatId, ghlContactId: 'new-contact', ghlRegistrationId: 'new-registration', evidenceReference: 'verified-transfer-record', now: NOW })
    const after = await store.getStudioUsage({ seatId })
    expect(after.seat).toMatchObject({ spentCents: 150, heldCents: 300, availableCents: 50, accessVersion: before.seat.accessVersion + 1 })
    expect((await store.getGeneration({ seatId, jobId: pending.id })).state).toBe('reserved')
  })

  it('keeps hard ceiling/currency/date/registration uniqueness constraints in the database', async () => {
    await expect(state.db.query('update workshop_studio_cohorts set limit_cents = 6001 where id = $1', [cohortId])).rejects.toThrow()
    await expect(state.db.query('update workshop_studio_cohorts set learner_limit_cents = 501 where id = $1', [cohortId])).rejects.toThrow()
    await expect(state.db.query("update workshop_studio_cohorts set currency = 'EUR' where id = $1", [cohortId])).rejects.toThrow()
    await expect(state.db.query("update workshop_studio_cohorts set access_expires_at = '2026-11-14T19:00:00Z' where id = $1", [cohortId])).rejects.toThrow()
    const existing = (await state.db.query('select * from workshop_studio_seats where id = $1', [seatId])).rows[0]
    await expect(state.db.query(`insert into workshop_studio_seats (cohort_id, ghl_calendar_id, ghl_registration_id, ghl_contact_id)
      values ($1, $2, $3, $4)`, [cohortId, existing.ghl_calendar_id, existing.ghl_registration_id, 'duplicate-contact'])).rejects.toThrow()
  })

  it('rejects a terminal database state without a known actual charge', async () => {
    const job = await reserve()
    await expect(state.db.query("update workshop_studio_jobs set state = 'settled' where id = $1", [job.id])).rejects.toThrow()
    await expect(state.db.query("update workshop_studio_jobs set state = 'uncharged' where id = $1", [job.id])).rejects.toThrow()
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(200)
  })

  it('starts newly inserted cohorts paused and registrations pending by default', async () => {
    const newCohort = (await state.db.query(`insert into workshop_studio_cohorts
      (workshop_slug, session_starts_at, session_ends_at, access_opens_at, access_expires_at)
      values ('test-only', '2026-11-06T17:00:00Z', '2026-11-06T19:00:00Z',
        '2026-11-05T17:00:00Z', '2026-11-13T19:00:00Z') returning *`)).rows[0]
    expect(newCohort.paused).toBe(true)
    const newSeat = (await state.db.query(`insert into workshop_studio_seats
      (cohort_id, ghl_calendar_id, ghl_registration_id, ghl_contact_id)
      values ($1, 'test-calendar', 'test-registration', 'test-contact') returning *`, [newCohort.id])).rows[0]
    expect(newSeat.registration_state).toBe('pending')
    await expect(reserve({ seatId: newSeat.id })).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
  })

  it('preserves populated usage and uniqueness when the migration is rerun', async () => {
    const requestKey = randomUUID()
    const job = await reserve({ requestKey })
    await state.db.exec(readFileSync(new URL('../db/migrations/006_workshop_studio.sql', import.meta.url), 'utf8'))
    expect((await reserve({ requestKey })).id).toBe(job.id)
    expect((await store.getStudioUsage({ seatId })).seat.heldCents).toBe(200)
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(1)
  })
})
