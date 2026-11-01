import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'

const state = vi.hoisted(() => ({ db: null, enabled: true, eligible: true, estimate: null, failAudit: false }))
vi.mock('../lib/db.js', () => ({ query: (...args) => state.db.query(...args), transaction: (work) => state.db.transaction((client) => work({ query: (...args) => {
  if (state.failAudit && /insert into workshop_studio_events/i.test(args[0])) { state.failAudit = false; throw new Error('Simulated audit failure') }
  return client.query(...args)
} })) }))
vi.mock('../lib/workshopStudioFeatures.js', () => ({ studioAccessEnabled: () => state.enabled, studioProviderTransportEnabled: () => state.enabled, studioReadiness: () => ({ providerSubmissionEnabled: state.enabled }) }))
vi.mock('../lib/workshopStudioTransport.js', () => ({ createStudioTransport: () => ({ estimate: (...args) => state.estimate(...args) }) }))
vi.mock('../lib/workshopStudioEligibility.js', () => ({ verifyStudioRegistration: vi.fn(async ({ seatId, now }) => {
  if (!state.eligible) throw Object.assign(new Error('Not verified'), { code: 'REGISTRATION_INELIGIBLE' })
  const seat = (await state.db.query('select * from workshop_studio_seats where id = $1', [seatId])).rows[0]
  return { seatId, cohortId: seat.cohort_id, accessVersion: seat.access_version, calendarId: seat.ghl_calendar_id,
    registrationId: seat.ghl_registration_id, contactId: seat.ghl_contact_id, checkedAt: now }
}) }))
import { issueStudioQuote, getStudioQuote, reserveQuotedGeneration, claimQuotedGeneration } from '../lib/workshopStudioQuotes.js'
import { studioRequestHash } from '../lib/workshopStudioProvider.js'
import { getStudioUsage, transferStudioSeat } from '../lib/workshopStudioStore.js'
import { verifyStudioRegistration } from '../lib/workshopStudioEligibility.js'

const NOW = new Date('2026-11-06T17:00:00Z')
const request = { model: 'bytedance/seedance-2.5/reference-to-video', prompt: 'One corridor shot', duration: 8, resolution: '720p',
  aspectRatio: '16:9', outputFormat: 'mp4', generateAudio: false, reference: { assetId: 'reference-one', sha256: 'a'.repeat(64) } }
const payload = { prompt: request.prompt, duration: 8, resolution: '720p', aspect_ratio: '16:9', output_format: 'mp4', generate_audio: false,
  video_urls: ['https://class-assets.example/reference.mp4?private=one'] }
let seatId, cohortId
const issue = (changes = {}) => issueStudioQuote({ seatId, accessVersion: 1, request, now: NOW, ...changes })
const reserve = (quote, changes = {}) => reserveQuotedGeneration({ seatId, accessVersion: 1, quoteId: quote.id, requestKey: randomUUID(), now: NOW, ...changes })
const claim = (job, changes = {}) => claimQuotedGeneration({ seatId, accessVersion: 1, jobId: job.id, now: NOW, ...changes })
async function scalar(sql, values = []) { return Object.values((await state.db.query(sql, values)).rows[0])[0] }

beforeAll(async () => {
  state.db = new PGlite()
  for (const name of ['006_workshop_studio.sql','007_workshop_studio_access.sql','008_workshop_studio_submission.sql','009_workshop_studio_quotes.sql']) {
    const sql = readFileSync(new URL('../db/migrations/' + name, import.meta.url), 'utf8')
    await state.db.exec(sql); await state.db.exec(sql)
  }
}, 30000)
beforeEach(async () => {
  state.enabled = true; state.eligible = true; state.failAudit = false
  vi.clearAllMocks()
  await state.db.exec('truncate workshop_studio_cohorts cascade')
  cohortId = randomUUID(); seatId = randomUUID()
  await state.db.query(`insert into workshop_studio_cohorts
    (id, workshop_slug, session_starts_at, session_ends_at, access_opens_at, access_expires_at, paused)
    values ($1,'ai-video-editing','2026-11-06T17:00:00Z','2026-11-06T19:00:00Z','2026-11-05T17:00:00Z','2026-11-13T19:00:00Z',false)`, [cohortId])
  await state.db.query(`insert into workshop_studio_seats (id,cohort_id,ghl_calendar_id,ghl_registration_id,ghl_contact_id,registration_state)
    values ($1,$2,'video-calendar','registration-one','contact-one','eligible')`, [seatId, cohortId])
  state.estimate = vi.fn(async () => ({ maximumCostCents: 200, currency: 'USD', requestHash: studioRequestHash(request),
    correlationId: 'account-estimate-receipt', providerPayload: structuredClone(payload) }))
})
afterAll(async () => { await state.db?.close() })

describe('trusted private quote persistence and atomic quoted jobs', () => {
  it('persists a server-account estimate with an immutable private payload and five-minute expiry', async () => {
    const quote = await issue()
    expect(quote).toMatchObject({ maximumCostCents: 200, currency: 'USD' })
    expect(new Date(quote.expiresAt).toISOString()).toBe('2026-11-06T17:05:00.000Z')
    const stored = (await state.db.query('select * from workshop_studio_quotes where id = $1', [quote.id])).rows[0]
    expect(stored.provider_payload).toEqual(payload)
    expect(stored.provider_correlation_id).toBe('account-estimate-receipt')
    const view = await getStudioQuote({ seatId, accessVersion: 1, quoteId: quote.id, now: NOW })
    expect(view).not.toHaveProperty('providerPayload'); expect(view).not.toHaveProperty('requestHash')
    expect(JSON.stringify(view)).not.toContain('private=one')
  })
  it('denies issuance before provider work when access is disabled or GHL is not verified', async () => {
    state.enabled = false
    await expect(issue({ paid: true })).rejects.toMatchObject({ code: 'STUDIO_UNAVAILABLE' })
    state.enabled = true; state.eligible = false
    await expect(issue({ paid: true })).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
    expect(state.estimate).not.toHaveBeenCalled()
  })
  it.each([
    { maximumCostCents: 501 }, { maximumCostCents: -1 }, { maximumCostCents: 1.5 }, { currency: 'EUR' },
    { requestHash: 'forged' }, { correlationId: null }, { providerPayload: { ...payload, duration: 9 } },
  ])('rejects over-cap/forged/incomplete provider evidence: %s', async (change) => {
    state.estimate.mockResolvedValueOnce({ maximumCostCents: 200, currency: 'USD', requestHash: studioRequestHash(request),
      correlationId: 'receipt', providerPayload: structuredClone(payload), ...change })
    await expect(issue()).rejects.toThrow()
    expect(await scalar('select count(*)::int from workshop_studio_quotes')).toBe(0)
  })
  it('rechecks transfer/cancellation after the remote estimate without holding a database connection', async () => {
    const original = state.estimate.getMockImplementation()
    state.estimate.mockImplementationOnce(async (...args) => {
      await transferStudioSeat({ seatId, ghlContactId: 'replacement', ghlRegistrationId: 'replacement-registration', evidenceReference: 'verified-transfer', now: NOW })
      return original(...args)
    })
    await expect(issue()).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    expect(await scalar('select count(*)::int from workshop_studio_quotes')).toBe(0)
  })
  it('uses database pricing, ignores client overrides and reuses the same intent without extra holds', async () => {
    const quote = await issue(); const requestKey = randomUUID()
    const first = await reserve(quote, { requestKey, maximumCostCents: 1, requestHash: 'forged' })
    const second = await reserve(quote, { requestKey })
    expect(second.id).toBe(first.id)
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(200)
    await expect(reserve(quote)).rejects.toMatchObject({ code: 'QUOTE_USED' })
  })
  it('allows only one simultaneous new job to consume a quote', async () => {
    const quote = await issue()
    const attempts = await Promise.allSettled([reserve(quote), reserve(quote)])
    expect(attempts.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(1)
  })
  it('does not reserve an expired quote or expose a quote to another seat/version', async () => {
    const quote = await issue()
    await expect(reserve(quote, { now: new Date('2026-11-06T17:05:00Z') })).rejects.toMatchObject({ code: 'QUOTE_EXPIRED' })
    expect(await getStudioQuote({ seatId, accessVersion: 2, quoteId: quote.id, now: NOW }).catch(() => null)).toBeNull()
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(0)
  })
  it('returns a frozen payload only to the sole submission claimant and keeps uncertainty held', async () => {
    const quote = await issue(); const job = await reserve(quote)
    const winners = await Promise.all([claim(job), claim(job)])
    const winner = winners.find((r) => r.claimed)
    expect(winner).toMatchObject({ providerPayload: payload, providerIdempotencyKey: job.id })
    expect(winners.find((r) => !r.claimed)).not.toHaveProperty('providerPayload')
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(200)
    await state.db.exec(readFileSync(new URL('../db/migrations/009_workshop_studio_quotes.sql', import.meta.url), 'utf8'))
    expect((await claim(job)).claimed).toBe(false)
  })
  it('rejects expired or tampered quote payloads before a submission claim', async () => {
    const quote = await issue(); const job = await reserve(quote)
    await expect(claim(job, { now: new Date('2026-11-06T17:05:00Z') })).rejects.toMatchObject({ code: 'QUOTE_EXPIRED' })
    await state.db.query("update workshop_studio_quotes set provider_payload = jsonb_set(provider_payload,'{duration}','9') where id = $1", [quote.id])
    await expect(claim(job)).rejects.toMatchObject({ code: 'QUOTE_MISMATCH' })
    expect(await scalar('select submission_claimed_at from workshop_studio_jobs where id = $1', [job.id])).toBeNull()
  })
  it('rolls back quote consumption, job creation and allowance holds together', async () => {
    const quote = await issue(); const requestKey = randomUUID()
    state.failAudit = true
    await expect(reserve(quote, { requestKey })).rejects.toThrow('Simulated audit failure')
    expect(await scalar('select bound_job_id from workshop_studio_quotes where id = $1', [quote.id])).toBeNull()
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(0)
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(0)
    await reserve(quote, { requestKey })
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(200)
  })
  it('uses fresh server time after eligibility checks before reserving or claiming', async () => {
    const quote = await issue(); const clock = new Date('2026-11-06T17:04:59Z')
    const base = verifyStudioRegistration.getMockImplementation()
    verifyStudioRegistration.mockImplementationOnce(async (args) => { const proof = await base(args); clock.setTime(clock.getTime() + 2000); return proof })
    await expect(reserve(quote, { now: clock })).rejects.toMatchObject({ code: 'QUOTE_EXPIRED' })
    expect(await scalar('select count(*)::int from workshop_studio_jobs')).toBe(0)
    const job = await reserve(quote)
    clock.setTime(new Date('2026-11-06T17:04:59Z').getTime())
    verifyStudioRegistration.mockImplementationOnce(async (args) => { const proof = await base(args); clock.setTime(clock.getTime() + 2000); return proof })
    await expect(claim(job, { now: clock })).rejects.toMatchObject({ code: 'QUOTE_EXPIRED' })
  })
  it('does not extend estimate lifetime when the final eligibility check takes time', async () => {
    const clock = new Date(NOW)
    const base = verifyStudioRegistration.getMockImplementation()
    verifyStudioRegistration.mockImplementationOnce(base).mockImplementationOnce(async (args) => {
      const proof = await base(args); clock.setTime(clock.getTime() + 2000); return proof
    })
    const quote = await issue({ now: clock })
    expect(new Date(quote.expiresAt).toISOString()).toBe('2026-11-06T17:05:00.000Z')
    const stored = (await state.db.query('select estimated_at from workshop_studio_quotes where id = $1', [quote.id])).rows[0]
    expect(new Date(stored.estimated_at).toISOString()).toBe('2026-11-06T17:00:00.000Z')
  })
})
