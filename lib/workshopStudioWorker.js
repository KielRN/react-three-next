// Prepared server-only worker composition. No scheduler, HTTP route or live
// invocation is connected. The imported immutable release gates remain false.
import { query, transaction } from './db.js'
import { claimQuotedGeneration } from './workshopStudioQuotes.js'
import { lockStudioSeat } from './workshopStudioStore.js'
import { verifyStudioRegistration } from './workshopStudioEligibility.js'
import { studioAccessEnabled, studioProviderTransportEnabled, studioReadiness } from './workshopStudioFeatures.js'
import { checkStudioAccess, checkStudioRegistrationProof, fail, requireTime, requireUuid } from './workshopStudioPolicy.js'
import { studioRequestHash, studioPayloadHash } from './workshopStudioProvider.js'
import { createStudioTransport } from './workshopStudioTransport.js'

const provider = createStudioTransport()
const active = new Set(['queued', 'in_progress'])
const terminal = new Set(['completed', 'failed', 'canceled', 'nsfw'])
const held = new Set(['reserved', 'submitted', 'unknown'])
function enabled(submitting = false) {
  if (!studioProviderTransportEnabled() || (submitting && (!studioAccessEnabled() || !studioReadiness().providerSubmissionEnabled))) {
    fail('PROVIDER_DISABLED', 'The studio worker has not been activated.')
  }
}
function statusEndpoint(id, value) {
  requireUuid(id)
  if (value !== `https://api.higgsfield.ai/requests/${id}/status`) fail('PROVIDER_BAD_RESPONSE', 'Provider correlation is invalid.')
}
function privateVideo(value) {
  let url
  try { url = new URL(value) } catch { fail('PROVIDER_BAD_RESPONSE', 'A verified private output is required.') }
  if (typeof value !== 'string' || value.length > 4096 || url.protocol !== 'https:' || url.username || url.password || url.hash || (url.port && url.port !== '443')) {
    fail('PROVIDER_BAD_RESPONSE', 'A verified private output is required.')
  }
  return value // No fetch occurs here. Future storage must separately enforce an origin allowlist.
}
function view(job, now) {
  return { jobId: job.id, providerState: job.provider_state || null,
    outputReady: job.provider_state === 'completed' && Boolean(job.provider_video_url) && Boolean(job.provider_expires_at) && new Date(job.provider_expires_at) > now,
    billingVerified: false }
}
async function lockedJob(client, jobId) {
  const reference = (await client.query('select seat_id from workshop_studio_jobs where id = $1', [jobId])).rows[0]
  if (!reference) fail('NOT_FOUND', 'Studio job not found.')
  const records = await lockStudioSeat(client, reference.seat_id)
  const job = (await client.query('select * from workshop_studio_jobs where id = $1 for update', [jobId])).rows[0]
  return { ...records, job }
}
async function event(client, job, kind, providerState, now) {
  const reference = `${job.provider_job_id}:${providerState}`
  await client.query(`insert into workshop_studio_events (cohort_id,seat_id,job_id,kind,evidence_reference,details,created_at)
    values ($1,$2,$3,$4,$5,$6,$7) on conflict do nothing`,
  [job.cohort_id,job.seat_id,job.id,kind,reference,JSON.stringify({ providerState }),now])
}

async function prePostCheck({ jobId, seatId, accessVersion, claim, clock }) {
  const proof = await verifyStudioRegistration({ seatId, now: clock() })
  await transaction(async client => {
    const { cohort, seat, job } = await lockedJob(client, jobId)
    const time = clock()
    if (job.seat_id !== seatId || seat.access_version !== accessVersion || job.owner_access_version !== accessVersion) fail('INVALID_ACCESS', 'Studio access has changed.')
    checkStudioAccess(cohort,seat,time)
    checkStudioRegistrationProof(proof,seat,time)
    const quote = (await client.query('select * from workshop_studio_quotes where id = $1 for update', [job.quote_id])).rows[0]
    if (job.state !== 'unknown' || !job.submission_claimed_at || job.provider_job_id || !quote || quote.bound_job_id !== job.id ||
        quote.access_version !== accessVersion || quote.request_hash !== studioRequestHash(claim.request) ||
        quote.payload_hash !== studioPayloadHash(claim.request,claim.providerPayload) || quote.maximum_cost_cents !== job.reserved_cents ||
        quote.request_hash !== job.request_hash || new Date(quote.expires_at) <= time || new Date(claim.quoteExpiresAt) <= time) {
      fail('QUOTE_MISMATCH', 'The claimed private request is no longer eligible for submission.')
    }
  })
}
async function recordAcceptance(jobId, receipt, clock) {
  if (!receipt || !active.has(receipt.providerState)) fail('PROVIDER_BAD_RESPONSE', 'Provider acceptance is invalid.')
  statusEndpoint(receipt.requestId,receipt.statusUrl)
  await transaction(async client => {
    const { job } = await lockedJob(client,jobId)
    if (!job.submission_claimed_at || (job.provider_job_id && job.provider_job_id !== receipt.requestId)) fail('PROVIDER_CONFLICT', 'A different provider request is bound.')
    if (job.provider_status_url) {
      if (job.provider_status_url !== receipt.statusUrl) fail('PROVIDER_CONFLICT', 'A different provider receipt is bound.')
      return
    }
    const time = clock()
    const updated = (await client.query(`update workshop_studio_jobs set provider_status_url = $2, provider_job_id = $3,
      provider_state = $4, provider_observed_at = $5, state = $6, updated_at = $5 where id = $1 returning *`,
    [jobId,receipt.statusUrl,receipt.requestId,receipt.providerState,time,held.has(job.state) ? 'submitted' : job.state])).rows[0]
    await event(client,updated,'submitted',receipt.providerState,time)
  })
}

export async function dispatchStudioJob({ jobId, seatId, accessVersion, now } = {}) {
  enabled(true)
  requireUuid(jobId); requireUuid(seatId)
  const clock = () => requireTime(now)
  const claim = await claimQuotedGeneration({ jobId,seatId,accessVersion,now })
  if (!claim.claimed) return { jobId, dispatched: false }
  try {
    await prePostCheck({ jobId,seatId,accessVersion,claim,clock })
    enabled(true)
    if (new Date(claim.quoteExpiresAt) <= clock()) fail('QUOTE_EXPIRED', 'Pricing expired before submission.')
    const receipt = await provider.submit({ request:claim.request,providerPayload:claim.providerPayload,idempotencyKey:claim.providerIdempotencyKey })
    await recordAcceptance(jobId,receipt,clock)
    return { jobId, dispatched:true,state:'submitted' }
  } catch {
    // Claim already committed unknown/held. Never resubmit, clear allowance or
    // echo a raw transport/database error after an uncertain external boundary.
    return { jobId,dispatched:false,uncertain:true }
  }
}

export async function pollStudioJob({ jobId, now } = {}) {
  enabled()
  requireUuid(jobId)
  const clock = () => requireTime(now)
  const candidate = (await query('select * from workshop_studio_jobs where id = $1', [jobId])).rows[0]
  if (!candidate) fail('NOT_FOUND', 'Studio job not found.')
  if (!candidate.provider_job_id || !candidate.provider_status_url) return view(candidate,clock())
  statusEndpoint(candidate.provider_job_id,candidate.provider_status_url)
  let result
  try { result = await provider.status({ requestId:candidate.provider_job_id,statusUrl:candidate.provider_status_url }) }
  catch { fail('PROVIDER_UNAVAILABLE', 'Provider status could not be confirmed; the allowance remains held.') }
  if (result?.requestId !== candidate.provider_job_id || (!active.has(result.providerState) && !terminal.has(result.providerState))) {
    fail('PROVIDER_BAD_RESPONSE', 'Provider status correlation is invalid.')
  }
  const videoUrl = result.providerState === 'completed' ? privateVideo(result.videoUrl) : null
  const expires = result.expiresAt == null ? null : new Date(result.expiresAt)
  if (expires && !Number.isFinite(expires.getTime())) fail('PROVIDER_BAD_RESPONSE', 'Provider output expiry is invalid.')
  return transaction(async client => {
    const { job } = await lockedJob(client,jobId)
    const time = clock()
    if (job.provider_job_id !== candidate.provider_job_id || job.provider_status_url !== candidate.provider_status_url) fail('PROVIDER_CONFLICT', 'Provider identity changed.')
    if (terminal.has(job.provider_state)) {
      if (active.has(result.providerState)) return view(job,time) // Late active reads cannot regress terminal results.
      if (job.provider_state !== result.providerState || job.provider_video_url !== videoUrl) fail('PROVIDER_CONFLICT', 'Provider terminal evidence conflicts; preserve the held allowance.')
    } else if (job.provider_state === 'in_progress' && result.providerState === 'queued') return view(job,time)
    const earliestExpiry = job.provider_expires_at && expires ? new Date(Math.min(new Date(job.provider_expires_at).getTime(),expires.getTime())) : job.provider_expires_at || expires
    const updated = (await client.query(`update workshop_studio_jobs set provider_state = $2, provider_video_url = $3,
      provider_expires_at = $4, provider_observed_at = $5, updated_at = $5 where id = $1 returning *`,
    [jobId,result.providerState,videoUrl,earliestExpiry,time])).rows[0]
    await event(client,updated,'provider_status',result.providerState,time)
    // No actual_cost_cents or financial state mutation. Even completed/failed/
    // canceled/expired results retain holds until independent billing proof.
    return view(updated,time)
  })
}
