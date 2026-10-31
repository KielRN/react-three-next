// Server-side persistence only. No HTTP handlers, credentials, access issuance or
// provider calls live here. Callers must independently verify identity/eligibility
// and exact provider quotes before reserving. Reconciliation requires billing proof.
import { query, transaction } from './db.js'
import { checkStudioAccess, fail, requireReference, requireTime, requireUuid, validateReservation } from './workshopStudioPolicy.js'

const pending = new Set(['reserved', 'submitted', 'unknown'])

function jobRecord(row) {
  return row ? {
    id: row.id, cohortId: row.cohort_id, seatId: row.seat_id,
    requestKey: row.request_key, requestHash: row.request_hash, currency: row.currency,
    maximumCostCents: row.reserved_cents, actualCostCents: row.actual_cost_cents,
    state: row.state, providerJobId: row.provider_job_id, incident: row.incident,
  } : null
}

// Every writer locks cohort -> seat -> job, on the transaction's one connection.
// This serializes aggregate budget decisions even for requests on different seats.
async function lockSeat(client, seatId) {
  const reference = (await client.query('select cohort_id from workshop_studio_seats where id = $1', [seatId])).rows[0]
  if (!reference) fail('NOT_FOUND', 'Studio seat not found.')
  const cohort = (await client.query('select * from workshop_studio_cohorts where id = $1 for update', [reference.cohort_id])).rows[0]
  const seat = (await client.query('select * from workshop_studio_seats where id = $1 for update', [seatId])).rows[0]
  if (!seat || seat.cohort_id !== cohort?.id) fail('SEAT_CHANGED', 'Studio seat changed; reload before retrying.')
  return { cohort, seat }
}

async function lockJob(client, jobId) {
  const reference = (await client.query('select seat_id from workshop_studio_jobs where id = $1', [jobId])).rows[0]
  if (!reference) fail('NOT_FOUND', 'Studio job not found.')
  const records = await lockSeat(client, reference.seat_id)
  const job = (await client.query('select * from workshop_studio_jobs where id = $1 for update', [jobId])).rows[0]
  return { ...records, job }
}

async function audit(client, { cohortId, seatId, jobId = null, kind, evidenceReference = null, details = {}, now }) {
  await client.query(`insert into workshop_studio_events
    (cohort_id, seat_id, job_id, kind, evidence_reference, details, created_at)
    values ($1, $2, $3, $4, $5, $6, $7) on conflict do nothing`,
  [cohortId, seatId, jobId, kind, evidenceReference, JSON.stringify(details), now])
}

async function usage(client, cohortId, seatId) {
  const sums = (await client.query(`select
    coalesce(sum(reserved_cents) filter (where state in ('reserved','submitted','unknown')), 0)::bigint as cohort_held,
    coalesce(sum(actual_cost_cents), 0)::bigint as cohort_spent,
    coalesce(sum(reserved_cents) filter (where seat_id = $2 and state in ('reserved','submitted','unknown')), 0)::bigint as seat_held,
    coalesce(sum(actual_cost_cents) filter (where seat_id = $2), 0)::bigint as seat_spent
    from workshop_studio_jobs where cohort_id = $1`, [cohortId, seatId])).rows[0]
  return Object.fromEntries(Object.entries(sums).map(([key, value]) => [key, Number(value)]))
}

export async function reserveGeneration({ seatId, requestKey, requestHash, maximumCostCents, currency = 'USD', now } = {}) {
  validateReservation({ seatId, requestKey, requestHash, maximumCostCents, currency })
  const time = requireTime(now)
  return transaction(async (client) => {
    const { cohort, seat } = await lockSeat(client, seatId)
    checkStudioAccess(cohort, seat, time)
    const existing = (await client.query('select * from workshop_studio_jobs where seat_id = $1 and request_key = $2', [seatId, requestKey])).rows[0]
    if (existing) {
      if (existing.request_hash !== requestHash || existing.reserved_cents !== maximumCostCents || existing.currency !== currency) {
        fail('REQUEST_CONFLICT', 'This request key already identifies a different request or quote.')
      }
      return jobRecord(existing)
    }
    const totals = await usage(client, cohort.id, seatId)
    if (totals.seat_held + totals.seat_spent + maximumCostCents > cohort.learner_limit_cents) fail('LEARNER_LIMIT', 'The learner allowance would be exceeded.')
    if (totals.cohort_held + totals.cohort_spent + maximumCostCents > cohort.limit_cents) fail('COHORT_LIMIT', 'The class allowance would be exceeded.')
    const active = (await client.query("select id from workshop_studio_jobs where seat_id = $1 and state in ('reserved','submitted','unknown') limit 1", [seatId])).rows[0]
    if (active) fail('JOB_PENDING', 'Reconcile the outstanding request before making another.')
    const job = (await client.query(`insert into workshop_studio_jobs
      (cohort_id, seat_id, request_key, request_hash, reserved_cents, currency, created_at, updated_at)
      values ($1, $2, $3, $4, $5, $6, $7, $7) returning *`,
    [cohort.id, seatId, requestKey, requestHash, maximumCostCents, currency, time])).rows[0]
    await audit(client, { cohortId: cohort.id, seatId, jobId: job.id, kind: 'reserved', details: { maximumCostCents }, now: time })
    return jobRecord(job)
  })
}

export async function getGeneration({ seatId, jobId }) {
  requireUuid(seatId)
  requireUuid(jobId)
  return jobRecord((await query('select * from workshop_studio_jobs where id = $1 and seat_id = $2', [jobId, seatId])).rows[0])
}

export async function getStudioUsage({ seatId }) {
  requireUuid(seatId)
  // Consistent cohort/seat/aggregate snapshot; shares writer lock order.
  return transaction(async (client) => {
    const { cohort, seat } = await lockSeat(client, seatId)
    const sums = await usage(client, cohort.id, seatId)
    const balance = (limitCents, heldCents, spentCents) => ({ limitCents, heldCents, spentCents, availableCents: Math.max(0, limitCents - heldCents - spentCents) })
    return {
      currency: cohort.currency, accessOpensAt: cohort.access_opens_at, accessExpiresAt: cohort.access_expires_at,
      paused: cohort.paused || seat.paused, revoked: Boolean(seat.revoked_at), registrationState: seat.registration_state,
      seat: { ...balance(cohort.learner_limit_cents, sums.seat_held, sums.seat_spent), accessVersion: seat.access_version },
      cohort: balance(cohort.limit_cents, sums.cohort_held, sums.cohort_spent),
    }
  })
}

export async function markGenerationSubmitted({ jobId, providerJobId, now }) {
  requireUuid(jobId)
  requireReference(providerJobId)
  const time = requireTime(now)
  return transaction(async (client) => {
    const { job } = await lockJob(client, jobId)
    if (job.provider_job_id && job.provider_job_id !== providerJobId) fail('PROVIDER_CONFLICT', 'A different provider job is already bound.')
    if (!pending.has(job.state) || (job.state === 'submitted' && job.provider_job_id === providerJobId)) return jobRecord(job)
    const other = (await client.query('select id from workshop_studio_jobs where provider_job_id = $1 and id <> $2', [providerJobId, jobId])).rows[0]
    if (other) fail('PROVIDER_CONFLICT', 'This provider job is already bound to another request.')
    const updated = (await client.query("update workshop_studio_jobs set state = 'submitted', provider_job_id = $2, updated_at = $3 where id = $1 returning *", [jobId, providerJobId, time])).rows[0]
    await audit(client, { cohortId: job.cohort_id, seatId: job.seat_id, jobId, kind: 'submitted', now: time })
    return jobRecord(updated)
  })
}

export async function markGenerationUnknown({ jobId, now }) {
  requireUuid(jobId)
  const time = requireTime(now)
  return transaction(async (client) => {
    const { job } = await lockJob(client, jobId)
    if (!pending.has(job.state) || job.state === 'unknown') return jobRecord(job)
    const updated = (await client.query("update workshop_studio_jobs set state = 'unknown', updated_at = $2 where id = $1 returning *", [jobId, time])).rows[0]
    await audit(client, { cohortId: job.cohort_id, seatId: job.seat_id, jobId, kind: 'unknown', now: time })
    return jobRecord(updated)
  })
}

export async function reconcileGeneration({ jobId, outcome, actualCostCents, currency = 'USD', evidenceReference, now }) {
  requireUuid(jobId)
  requireReference(evidenceReference, 'BILLING_EVIDENCE_REQUIRED')
  if (currency !== 'USD' || !Number.isSafeInteger(actualCostCents) || actualCostCents < 0 || actualCostCents > 1000000000 ||
      !['charged', 'uncharged'].includes(outcome) || (outcome === 'uncharged' ? actualCostCents !== 0 : actualCostCents === 0)) {
    fail('INVALID_RECONCILIATION', 'A verified charge or explicit uncharged result in integer USD cents is required.')
  }
  const time = requireTime(now)
  const result = await transaction(async (client) => {
    const { job } = await lockJob(client, jobId)
    const nextState = outcome === 'uncharged' ? 'uncharged' : 'settled'
    if (job.state === nextState && job.actual_cost_cents === actualCostCents) return jobRecord(job)
    const terminal = !pending.has(job.state)
    const higherCharge = terminal && nextState === 'settled' && actualCostCents > job.actual_cost_cents
    const conflict = terminal && !higherCharge
    const incident = actualCostCents > job.reserved_cents || higherCharge || conflict
    if (incident) {
      await client.query('update workshop_studio_cohorts set paused = true where id = $1', [job.cohort_id])
      await audit(client, { cohortId: job.cohort_id, seatId: job.seat_id, jobId, kind: 'billing_incident', evidenceReference,
        details: { previousState: job.state, previousCostCents: job.actual_cost_cents, actualCostCents, reservedCents: job.reserved_cents }, now: time })
    }
    // Commit the incident/pause, then report a conflict without erasing known cost.
    if (conflict) {
      await client.query('update workshop_studio_jobs set incident = true, updated_at = $2 where id = $1', [jobId, time])
      return { conflict: true }
    }
    const updated = (await client.query(`update workshop_studio_jobs set state = $2, actual_cost_cents = $3,
      incident = incident or $4, updated_at = $5 where id = $1 returning *`, [jobId, nextState, actualCostCents, incident, time])).rows[0]
    await audit(client, { cohortId: job.cohort_id, seatId: job.seat_id, jobId, kind: 'reconciled', evidenceReference, details: { outcome, actualCostCents }, now: time })
    return jobRecord(updated)
  })
  if (result.conflict) fail('RECONCILIATION_CONFLICT', 'Billing evidence conflicts with a settled result. The class is paused for review.')
  return result
}

// Internal transfer primitive: a future owner route must verify the replacement
// GHL registration before calling. It never resets cost or un-revokes access.
export async function transferStudioSeat({ seatId, ghlContactId, ghlRegistrationId, evidenceReference, now }) {
  requireUuid(seatId)
  requireReference(ghlContactId, 'INVALID_REFERENCE', 128)
  requireReference(ghlRegistrationId, 'INVALID_REFERENCE', 128)
  requireReference(evidenceReference, 'REGISTRATION_EVIDENCE_REQUIRED')
  const time = requireTime(now)
  return transaction(async (client) => {
    const { seat, cohort } = await lockSeat(client, seatId)
    if (seat.ghl_contact_id === ghlContactId && seat.ghl_registration_id === ghlRegistrationId) return { seatId, accessVersion: seat.access_version }
    const updated = (await client.query(`update workshop_studio_seats set ghl_contact_id = $2,
      ghl_registration_id = $3, access_version = access_version + 1 where id = $1 returning access_version`, [seatId, ghlContactId, ghlRegistrationId])).rows[0]
    await audit(client, { cohortId: cohort.id, seatId, kind: 'transferred', evidenceReference, now: time })
    return { seatId, accessVersion: updated.access_version }
  })
}
