// Server-only composition. No API route/issuer/worker is activated by this module.
import { transaction } from './db.js'
import { lockStudioSeat, reserveGenerationInTransaction, claimGenerationSubmissionInTransaction } from './workshopStudioStore.js'
import { checkStudioAccess, checkStudioRegistrationProof, fail, requireReference, requireTime, requireUuid, STUDIO_LEARNER_CAP_CENTS } from './workshopStudioPolicy.js'
import { studioAccessEnabled, studioProviderTransportEnabled, studioReadiness } from './workshopStudioFeatures.js'
import { verifyStudioRegistration } from './workshopStudioEligibility.js'
import { snapshotStudioRequest, canonicalStudioPayload, studioRequestHash, studioPayloadHash } from './workshopStudioProvider.js'
import { createStudioTransport } from './workshopStudioTransport.js'

// This default client has no accepted private reference resolver/origins. Even a
// future flag change cannot issue live learner quotes until that wiring exists.
const provider = createStudioTransport()
function enabled(submitting = false) {
  if (!studioAccessEnabled() || !studioProviderTransportEnabled() || (submitting && !studioReadiness().providerSubmissionEnabled)) {
    fail('STUDIO_UNAVAILABLE', 'Studio quotes are not available yet.')
  }
}
function identity(seatId, accessVersion) {
  requireUuid(seatId)
  if (!Number.isSafeInteger(accessVersion) || accessVersion < 1) fail('INVALID_ACCESS', 'Valid scoped access is required.')
}
function checkRecords(records, accessVersion, proof, now) {
  if (records.seat.access_version !== accessVersion) fail('INVALID_ACCESS', 'Studio access has changed.')
  checkStudioAccess(records.cohort, records.seat, now)
  checkStudioRegistrationProof(proof, records.seat, now)
  return records
}
async function verifiedSeat(client, seatId, accessVersion, proof, clock) {
  const records = await lockStudioSeat(client, seatId)
  return checkRecords(records,accessVersion,proof,clock())
}
const view = (row) => row ? { id: row.id, currency: row.currency, maximumCostCents: row.maximum_cost_cents, expiresAt: row.expires_at } : null

function validateStoredQuote(quote, job = null) {
  try {
    if (studioRequestHash(quote.request_data) !== quote.request_hash || studioPayloadHash(quote.request_data, quote.provider_payload) !== quote.payload_hash ||
        (job && (job.quote_id !== quote.id || job.request_hash !== quote.request_hash || job.reserved_cents !== quote.maximum_cost_cents || job.currency !== quote.currency))) {
      fail('QUOTE_MISMATCH', 'Quote evidence has changed.')
    }
  } catch { fail('QUOTE_MISMATCH', 'Quote evidence does not match its private payload.') }
}

export async function issueStudioQuote({ seatId, accessVersion, request, now } = {}) {
  enabled()
  identity(seatId, accessVersion)
  const snapshot = snapshotStudioRequest(request)
  const clock = () => requireTime(now)
  const start = requireTime(now)
  const before = await verifyStudioRegistration({ seatId, now: start })
  await transaction((client) => verifiedSeat(client, seatId, accessVersion, before, clock))
  // No database connection is held across the external estimate or GHL reads.
  const estimate = await provider.estimate({ request: snapshot })
  const estimatedAt = clock()
  if (estimate?.currency !== 'USD' || estimate.requestHash !== studioRequestHash(snapshot) ||
      !Number.isSafeInteger(estimate.maximumCostCents) || estimate.maximumCostCents < 1 || estimate.maximumCostCents > STUDIO_LEARNER_CAP_CENTS) {
    fail('INVALID_QUOTE', 'An accepted account estimate within the learner cap is required.')
  }
  requireReference(estimate.correlationId, 'QUOTE_EVIDENCE_REQUIRED')
  const payload = canonicalStudioPayload(snapshot, estimate.providerPayload)
  const proof = await verifyStudioRegistration({ seatId, now: clock() })
  return transaction(async (client) => {
    const { cohort } = await verifiedSeat(client, seatId, accessVersion, proof, clock)
    const expires = new Date(Math.min(estimatedAt.getTime() + 300000, new Date(cohort.access_expires_at).getTime()))
    if (expires <= clock()) fail('QUOTE_EXPIRED', 'The estimate expired before it could be saved.')
    const quote = (await client.query(`insert into workshop_studio_quotes
      (cohort_id,seat_id,access_version,request_hash,payload_hash,request_data,provider_payload,maximum_cost_cents,provider_correlation_id,estimated_at,expires_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning *`,
    [cohort.id,seatId,accessVersion,studioRequestHash(snapshot),studioPayloadHash(snapshot,payload),JSON.stringify(snapshot),JSON.stringify(payload),
      estimate.maximumCostCents,estimate.correlationId,estimatedAt,expires])).rows[0]
    return view(quote)
  })
}

export async function getStudioQuote({ seatId, accessVersion, quoteId, now }) {
  enabled()
  identity(seatId, accessVersion); requireUuid(quoteId)
  const clock = () => requireTime(now)
  const proof = await verifyStudioRegistration({ seatId, now: clock() })
  return transaction(async (client) => {
    const records = await verifiedSeat(client, seatId, accessVersion, proof, clock)
    const quote = (await client.query('select * from workshop_studio_quotes where id = $1 and seat_id = $2 and access_version = $3', [quoteId,seatId,accessVersion])).rows[0]
    checkRecords(records,accessVersion,proof,clock())
    return quote && new Date(quote.expires_at) > clock() ? view(quote) : null
  })
}

export async function reserveQuotedGeneration({ seatId, accessVersion, quoteId, requestKey, now }) {
  enabled(true)
  identity(seatId,accessVersion); requireUuid(quoteId)
  const clock = () => requireTime(now)
  const proof = await verifyStudioRegistration({ seatId, now: clock() })
  return transaction(async (client) => {
    const records = await verifiedSeat(client,seatId,accessVersion,proof,clock)
    const quote = (await client.query('select * from workshop_studio_quotes where id = $1 and seat_id = $2 and access_version = $3 for update', [quoteId,seatId,accessVersion])).rows[0]
    if (!quote) fail('NOT_FOUND', 'Studio quote not found.')
    const time = clock()
    checkRecords(records,accessVersion,proof,time)
    validateStoredQuote(quote)
    return reserveGenerationInTransaction(client, { seatId,accessVersion,requestKey,quoteId,requestHash:quote.request_hash,
      maximumCostCents:quote.maximum_cost_cents,currency:quote.currency,now:time })
  })
}

export async function claimQuotedGeneration({ seatId, accessVersion, jobId, now }) {
  enabled(true)
  identity(seatId,accessVersion); requireUuid(jobId)
  const clock = () => requireTime(now)
  const proof = await verifyStudioRegistration({ seatId, now: clock() })
  return transaction(async (client) => {
    const records = await verifiedSeat(client,seatId,accessVersion,proof,clock)
    const job = (await client.query('select * from workshop_studio_jobs where id = $1 and seat_id = $2 for update', [jobId,seatId])).rows[0]
    if (!job || job.owner_access_version !== accessVersion) fail('NOT_FOUND', 'Studio job not found.')
    if (job.submission_claimed_at || job.state !== 'reserved') return { claimed: false }
    if (!job.quote_id) fail('QUOTE_REQUIRED', 'A server-issued quote is required before submission.')
    const quote = (await client.query('select * from workshop_studio_quotes where id = $1 and seat_id = $2 and access_version = $3 for update', [job.quote_id,seatId,accessVersion])).rows[0]
    const time = clock()
    checkRecords(records,accessVersion,proof,time)
    if (!quote || quote.bound_job_id !== job.id) fail('QUOTE_MISMATCH', 'Quote is not bound to this job.')
    if (new Date(quote.expires_at) <= time) fail('QUOTE_EXPIRED', 'Refresh pricing before a new provider submission.')
    validateStoredQuote(quote,job)
    const claimed = await claimGenerationSubmissionInTransaction(client, { jobId,seatId,accessVersion,now:time })
    if (!claimed.claimed) return { claimed: false }
    return { ...claimed, request:snapshotStudioRequest(quote.request_data), providerPayload:canonicalStudioPayload(quote.request_data,quote.provider_payload), providerIdempotencyKey:job.id, quoteExpiresAt:quote.expires_at }
  })
}
