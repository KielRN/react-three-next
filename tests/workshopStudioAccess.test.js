import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'

const state = vi.hoisted(() => ({ db: null, enabled: true, eligible: true, failConsume: false }))
vi.mock('../lib/db.js', () => ({ query: (...args) => state.db.query(...args), transaction: (work) => state.db.transaction((client) => work({ query: (...args) => {
  if (state.failConsume && args[0].startsWith('update workshop_studio_codes')) { state.failConsume = false; throw new Error('Simulated consume failure') }
  return client.query(...args)
} })) }))
vi.mock('../lib/workshopStudioFeatures.js', () => ({ studioAccessEnabled: () => state.enabled }))
vi.mock('../lib/workshopStudioEligibility.js', () => ({ verifyStudioRegistration: vi.fn(async ({ seatId, now }) => {
  if (!state.eligible) throw Object.assign(new Error('Registration cancelled or not verified'), { code: 'REGISTRATION_INELIGIBLE' })
  const seat = (await state.db.query('select * from workshop_studio_seats where id = $1', [seatId])).rows[0]
  return { seatId, cohortId: seat.cohort_id, accessVersion: seat.access_version,
    calendarId: seat.ghl_calendar_id, registrationId: seat.ghl_registration_id, contactId: seat.ghl_contact_id, checkedAt: now }
}) }))
import { authenticateStudioSession, exchangeStudioCode, revokeStudioSession } from '../lib/workshopStudioAccess.js'
import { getStudioLearnerJob } from '../lib/workshopStudioAccess.js'
import { verifyStudioRegistration } from '../lib/workshopStudioEligibility.js'
import { reserveGeneration, transferStudioSeat } from '../lib/workshopStudioStore.js'

const NOW = new Date('2026-11-06T17:00:00Z')
const digest = (value) => createHash('sha256').update(value).digest('hex')
let seatId
let code
let cohortId
async function scalar(sql, values = []) { return Object.values((await state.db.query(sql, values)).rows[0])[0] }
async function makeCode(changes = {}) {
  const value = randomBytes(32).toString('base64url')
  await state.db.query(`insert into workshop_studio_codes
    (seat_id, access_version, code_hash, expires_at) values ($1, $2, $3, $4)`,
  [changes.seatId || seatId, changes.version || 1, digest(value), changes.expiresAt || '2026-11-06T17:15:00Z'])
  return value
}

beforeAll(async () => {
  state.db = new PGlite()
  for (const file of ['006_workshop_studio.sql', '007_workshop_studio_access.sql']) {
    const sql = readFileSync(new URL(`../db/migrations/${file}`, import.meta.url), 'utf8')
    await state.db.exec(sql)
    await state.db.exec(sql)
  }
}, 30000)
beforeEach(async () => {
  state.enabled = true
  state.eligible = true
  state.failConsume = false
  vi.clearAllMocks()
  await state.db.exec('truncate workshop_studio_cohorts cascade')
  cohortId = randomUUID()
  seatId = randomUUID()
  await state.db.query(`insert into workshop_studio_cohorts
    (id, workshop_slug, session_starts_at, session_ends_at, access_opens_at, access_expires_at, paused)
    values ($1, 'ai-video-editing', '2026-11-06T17:00:00Z', '2026-11-06T19:00:00Z',
      '2026-11-05T17:00:00Z', '2026-11-13T19:00:00Z', false)`, [cohortId])
  await state.db.query(`insert into workshop_studio_seats
    (id, cohort_id, ghl_calendar_id, ghl_registration_id, ghl_contact_id, registration_state)
    values ($1, $2, 'calendar-video', 'registration-one', 'contact-one', 'eligible')`, [seatId, cohortId])
  code = await makeCode()
})
afterAll(async () => { await state.db?.close() })

describe('private studio access on local synthetic records only', () => {
  it('exchanges a one-time code and stores only code/session hashes', async () => {
    const session = await exchangeStudioCode({ code, now: NOW })
    expect(session.token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(session.expiresAt.toISOString()).toBe('2026-11-13T19:00:00.000Z')
    const rows = await state.db.query('select * from workshop_studio_sessions')
    expect(rows.rows[0].token_hash).toBe(digest(session.token))
    expect(JSON.stringify(rows.rows)).not.toContain(session.token)
    expect(await scalar('select consumed_at is not null from workshop_studio_codes')).toBe(true)
    expect(await authenticateStudioSession({ token: session.token, now: NOW })).toMatchObject({ seatId, accessVersion: 1 })
    await expect(exchangeStudioCode({ code, now: NOW })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
  })

  it('allows only one simultaneous code exchange', async () => {
    const results = await Promise.allSettled([exchangeStudioCode({ code, now: NOW }), exchangeStudioCode({ code, now: NOW })])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(await scalar('select count(*)::int from workshop_studio_sessions')).toBe(1)
  })

  it('does not consume a code or issue a session when the release gate is off', async () => {
    state.enabled = false
    await expect(exchangeStudioCode({ code, now: NOW })).rejects.toMatchObject({ code: 'STUDIO_UNAVAILABLE' })
    expect(await scalar('select count(*)::int from workshop_studio_sessions')).toBe(0)
    expect(await scalar('select consumed_at from workshop_studio_codes')).toBeNull()
    expect(verifyStudioRegistration).not.toHaveBeenCalled()
  })

  it.each([undefined, '', 'bad-token', 'a'.repeat(43)])('rejects an invalid/unknown code: %s', async (value) => {
    await expect(exchangeStudioCode({ code: value, now: NOW })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
  })

  it('rejects an expired code at the boundary without consuming it', async () => {
    await expect(exchangeStudioCode({ code, now: new Date('2026-11-06T17:15:00Z') })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    expect(await scalar('select consumed_at from workshop_studio_codes')).toBeNull()
    expect(verifyStudioRegistration).not.toHaveBeenCalled()
  })

  it('does not accept a code based on local eligible status when GHL verification fails', async () => {
    state.eligible = false
    await expect(exchangeStudioCode({ code, now: NOW })).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
    expect(await scalar('select consumed_at from workshop_studio_codes')).toBeNull()
  })

  it('rejects a mismatched or stale server verification snapshot', async () => {
    verifyStudioRegistration.mockResolvedValueOnce({ seatId, cohortId, accessVersion: 1, calendarId: 'different', registrationId: 'registration-one', contactId: 'contact-one', checkedAt: NOW })
    await expect(exchangeStudioCode({ code, now: NOW })).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
    verifyStudioRegistration.mockResolvedValueOnce({ seatId, cohortId, accessVersion: 1, calendarId: 'calendar-video', registrationId: 'registration-one', contactId: 'contact-one', checkedAt: new Date(NOW.getTime() - 61000) })
    await expect(exchangeStudioCode({ code, now: NOW })).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
  })

  it.each([
    ["update workshop_studio_seats set revoked_at = now() where id = $1", 'ACCESS_REVOKED'],
    ["update workshop_studio_seats set registration_state = 'refunded' where id = $1", 'REGISTRATION_INELIGIBLE'],
    ["update workshop_studio_seats set paused = true where id = $1", 'ACCESS_PAUSED'],
  ])('rejects an existing session after local access changes', async (sql, code) => {
    const session = await exchangeStudioCode({ code: await makeCode(), now: NOW })
    await state.db.query(sql, [seatId])
    await expect(authenticateStudioSession({ token: session.token, now: NOW })).rejects.toMatchObject({ code })
  })

  it('rechecks GHL cancellation/refund eligibility for an existing session', async () => {
    const session = await exchangeStudioCode({ code, now: NOW })
    state.eligible = false
    await expect(authenticateStudioSession({ token: session.token, now: NOW })).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
  })

  it('rejects missing/expired/revoked sessions and supports logout', async () => {
    await expect(authenticateStudioSession({ token: null, now: NOW })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    const session = await exchangeStudioCode({ code, now: NOW })
    await expect(authenticateStudioSession({ token: session.token, now: new Date('2026-11-13T19:00:00Z') })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    await revokeStudioSession({ token: session.token, now: NOW })
    await expect(authenticateStudioSession({ token: session.token, now: NOW })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
  })

  it('invalidates previous codes/sessions and hides prior learner jobs after a seat transfer', async () => {
    const session = await exchangeStudioCode({ code, now: NOW })
    const oldCode = await makeCode()
    const job = await reserveGeneration({ seatId, requestKey: randomUUID(), requestHash: digest('shot'), maximumCostCents: 200, now: NOW })
    expect(await getStudioLearnerJob({ seatId, accessVersion: 1, jobId: job.id, now: NOW })).toMatchObject({ id: job.id })
    await transferStudioSeat({ seatId, ghlContactId: 'new-contact', ghlRegistrationId: 'replacement-registration', evidenceReference: 'verified-transfer', now: NOW })
    await expect(authenticateStudioSession({ token: session.token, now: NOW })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    await expect(exchangeStudioCode({ code: oldCode, now: NOW })).rejects.toMatchObject({ code: 'INVALID_ACCESS' })
    expect(await getStudioLearnerJob({ seatId, accessVersion: 2, jobId: job.id, now: NOW })).toBeNull()
    expect(await getStudioLearnerJob({ seatId, accessVersion: 1, jobId: job.id, now: NOW })).toBeNull()
    // Previous registration ID cannot create a fresh allowance after transfer.
    await expect(state.db.query(`insert into workshop_studio_seats
      (cohort_id, ghl_calendar_id, ghl_registration_id, ghl_contact_id) values ($1, 'calendar-video', 'registration-one', 'old-contact')`, [cohortId])).rejects.toThrow()
  })

  it('does not expose another seat job, provider correlation or request fingerprint', async () => {
    const job = await reserveGeneration({ seatId, requestKey: randomUUID(), requestHash: digest('private shot'), maximumCostCents: 200, now: NOW })
    const view = await getStudioLearnerJob({ seatId, accessVersion: 1, jobId: job.id, now: NOW })
    expect(view).not.toHaveProperty('providerJobId')
    expect(view).not.toHaveProperty('requestHash')
    expect(view).not.toHaveProperty('requestKey')
    expect(await getStudioLearnerJob({ seatId: randomUUID(), accessVersion: 1, jobId: job.id, now: NOW })).toBeNull()
  })

  it('rolls back session issuance and code consumption together on failure', async () => {
    state.failConsume = true
    await expect(exchangeStudioCode({ code, now: NOW })).rejects.toThrow('Simulated consume failure')
    expect(await scalar('select count(*)::int from workshop_studio_sessions')).toBe(0)
    expect(await scalar('select consumed_at from workshop_studio_codes')).toBeNull()
    await exchangeStudioCode({ code, now: NOW })
    expect(await scalar('select count(*)::int from workshop_studio_sessions')).toBe(1)
  })

  it('checks current revocation/expiry at job lookup, after earlier authentication', async () => {
    const job = await reserveGeneration({ seatId, requestKey: randomUUID(), requestHash: digest('shot'), maximumCostCents: 200, now: NOW })
    expect(await getStudioLearnerJob({ seatId, accessVersion: 1, jobId: job.id, now: new Date('2026-11-13T19:00:00Z') })).toBeNull()
    await state.db.query('update workshop_studio_seats set revoked_at = now() where id = $1', [seatId])
    expect(await getStudioLearnerJob({ seatId, accessVersion: 1, jobId: job.id, now: NOW })).toBeNull()
  })
})
