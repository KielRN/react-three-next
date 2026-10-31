// Server persistence primitives. No production code issuer is exported.
import { createHash, randomBytes } from 'node:crypto'
import { query, transaction } from './db.js'
import { lockStudioSeat } from './workshopStudioStore.js'
import { checkStudioAccess, fail, requireTime, requireUuid } from './workshopStudioPolicy.js'
import { studioAccessEnabled } from './workshopStudioFeatures.js'
import { verifyStudioRegistration } from './workshopStudioEligibility.js'

const hash = (value) => createHash('sha256').update(value).digest('hex')
const isToken = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value)
function enabled() { if (!studioAccessEnabled()) fail('STUDIO_UNAVAILABLE', 'Studio access is not available yet.') }
function invalid() { fail('INVALID_ACCESS', 'Studio access is invalid or expired.') }

function verifySnapshot(proof, seat, now) {
  const checkedAt = new Date(proof?.checkedAt).getTime()
  if (proof?.seatId !== seat.id || proof?.cohortId !== seat.cohort_id || proof?.accessVersion !== seat.access_version ||
      proof?.calendarId !== seat.ghl_calendar_id || proof?.registrationId !== seat.ghl_registration_id ||
      proof?.contactId !== seat.ghl_contact_id || !Number.isFinite(checkedAt) || checkedAt > now.getTime() || now.getTime() - checkedAt > 60000) {
    fail('REGISTRATION_INELIGIBLE', 'Registration verification does not match current access.')
  }
}

export async function exchangeStudioCode({ code, now } = {}) {
  enabled()
  if (!isToken(code)) invalid()
  const time = requireTime(now)
  const codeHash = hash(code)
  const candidate = (await query('select seat_id, expires_at, consumed_at from workshop_studio_codes where code_hash = $1', [codeHash])).rows[0]
  if (!candidate || candidate.consumed_at || new Date(candidate.expires_at) <= time) invalid()
  const proof = await verifyStudioRegistration({ seatId: candidate.seat_id, now: time })
  return transaction(async (client) => {
    const { cohort, seat } = await lockStudioSeat(client, candidate.seat_id)
    const record = (await client.query('select * from workshop_studio_codes where code_hash = $1 for update', [codeHash])).rows[0]
    if (!record || record.consumed_at || new Date(record.expires_at) <= time || record.access_version !== seat.access_version) invalid()
    checkStudioAccess(cohort, seat, time)
    verifySnapshot(proof, seat, time)
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(cohort.access_expires_at)
    await client.query('insert into workshop_studio_sessions (token_hash, seat_id, access_version, created_at, expires_at) values ($1,$2,$3,$4,$5)',
      [hash(token), seat.id, seat.access_version, time, expiresAt])
    await client.query('update workshop_studio_codes set consumed_at = $2 where id = $1', [record.id, time])
    return { token, expiresAt }
  })
}

export async function authenticateStudioSession({ token, now } = {}) {
  enabled()
  if (!isToken(token)) invalid()
  const time = requireTime(now)
  const tokenHash = hash(token)
  const candidate = (await query('select * from workshop_studio_sessions where token_hash = $1', [tokenHash])).rows[0]
  if (!candidate || candidate.revoked_at || new Date(candidate.expires_at) <= time) invalid()
  const proof = await verifyStudioRegistration({ seatId: candidate.seat_id, now: time })
  return transaction(async (client) => {
    const { cohort, seat } = await lockStudioSeat(client, candidate.seat_id)
    const session = (await client.query('select * from workshop_studio_sessions where token_hash = $1 for update', [tokenHash])).rows[0]
    if (!session || session.revoked_at || new Date(session.expires_at) <= time || session.access_version !== seat.access_version) invalid()
    checkStudioAccess(cohort, seat, time)
    verifySnapshot(proof, seat, time)
    return { seatId: seat.id, cohortId: cohort.id, accessVersion: seat.access_version, expiresAt: new Date(session.expires_at) }
  })
}

export async function revokeStudioSession({ token, now } = {}) {
  if (!isToken(token)) return
  await query('update workshop_studio_sessions set revoked_at = $2 where token_hash = $1 and revoked_at is null', [hash(token), requireTime(now)])
}

// Authenticated routes must pass their server-derived seat/version, never values
// from URL/body. Even a transferred seat cannot view its predecessor's jobs.
export async function getStudioLearnerJob({ seatId, accessVersion, jobId, now }) {
  requireUuid(seatId)
  requireUuid(jobId)
  if (!Number.isSafeInteger(accessVersion) || accessVersion < 1) invalid()
  const time = requireTime(now)
  const row = (await query(`select j.id, j.state, j.reserved_cents, j.actual_cost_cents, j.incident
    from workshop_studio_jobs j join workshop_studio_seats s on s.id = j.seat_id
    join workshop_studio_cohorts c on c.id = s.cohort_id
    where j.id = $1 and j.seat_id = $2 and j.owner_access_version = $3 and s.access_version = $3
      and s.revoked_at is null and s.registration_state = 'eligible' and not s.paused and not c.paused
      and $4 >= c.access_opens_at and $4 < c.access_expires_at`,
  [jobId, seatId, accessVersion, time])).rows[0]
  return row ? { id: row.id, state: row.state, maximumCostCents: row.reserved_cents, actualCostCents: row.actual_cost_cents, incident: row.incident } : null
}
