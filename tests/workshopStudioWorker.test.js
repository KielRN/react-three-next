import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { PGlite } from '@electric-sql/pglite'

const state = vi.hoisted(() => ({ db: null, enabled: true, provider: null, failReceipt: false, afterClaim: null }))
vi.mock('../lib/db.js', () => ({ query: (...args) => state.db.query(...args), transaction: async work => {
  let claimed = false
  const result = await state.db.transaction(client => work({ query: (...args) => {
    if (/submission_claimed_at =/.test(args[0])) claimed = true
    if (state.failReceipt && /^update workshop_studio_jobs set provider_status_url/.test(args[0])) { state.failReceipt = false; throw new Error('private database failure') }
    return client.query(...args)
  } }))
  if (claimed && state.afterClaim) { const hook = state.afterClaim; state.afterClaim = null; await hook() }
  return result
} }))
vi.mock('../lib/workshopStudioFeatures.js', () => ({ studioAccessEnabled: () => state.enabled, studioProviderTransportEnabled: () => state.enabled, studioReadiness: () => ({ providerSubmissionEnabled: state.enabled }) }))
vi.mock('../lib/workshopStudioTransport.js', () => ({ createStudioTransport: () => ({ estimate: (...args) => state.provider.estimate(...args), submit: (...args) => state.provider.submit(...args), status: (...args) => state.provider.status(...args) }) }))
vi.mock('../lib/workshopStudioEligibility.js', () => ({ verifyStudioRegistration: vi.fn(async ({ seatId, now }) => {
  const seat = (await state.db.query('select * from workshop_studio_seats where id = $1', [seatId])).rows[0]
  return { seatId, cohortId: seat.cohort_id, accessVersion: seat.access_version, calendarId: seat.ghl_calendar_id, registrationId: seat.ghl_registration_id, contactId: seat.ghl_contact_id, checkedAt: now }
}) }))
import { issueStudioQuote, reserveQuotedGeneration } from '../lib/workshopStudioQuotes.js'
import { dispatchStudioJob, pollStudioJob } from '../lib/workshopStudioWorker.js'
import { getStudioUsage, reconcileGeneration, transferStudioSeat } from '../lib/workshopStudioStore.js'
import { getStudioLearnerJob } from '../lib/workshopStudioAccess.js'
import { studioRequestHash } from '../lib/workshopStudioProvider.js'

const NOW = new Date('2026-11-06T17:00:00Z')
const providerId = '01a19750-b3c2-76ab-a4d2-441566e5f4e2'
const statusUrl = `https://api.higgsfield.ai/requests/${providerId}/status`
const videoUrl = 'https://private-results.example/class-output.mp4'
const request = { model: 'bytedance/seedance-2.5/reference-to-video', prompt: 'A private corridor shot', duration: 10, resolution: '720p', aspectRatio: '16:9', outputFormat: 'mp4', generateAudio: false, reference: { assetId: 'class-reference', sha256: 'a'.repeat(64) } }
const payload = { prompt: request.prompt, duration: 10, resolution: '720p', aspect_ratio: '16:9', output_format: 'mp4', generate_audio: false, video_urls: ['https://private-reference.example/ref.mp4'] }
let seatId, cohortId
const dispatch = (job, changes = {}) => dispatchStudioJob({ seatId, accessVersion: 1, jobId: job.id, now: NOW, ...changes })
const poll = (job, changes = {}) => pollStudioJob({ jobId: job.id, now: NOW, ...changes })
const row = async job => (await state.db.query('select * from workshop_studio_jobs where id = $1', [job.id])).rows[0]
async function reserve() {
  const quote = await issueStudioQuote({ seatId, accessVersion: 1, request, now: NOW })
  return reserveQuotedGeneration({ seatId, accessVersion: 1, quoteId: quote.id, requestKey: randomUUID(), now: NOW })
}
beforeAll(async () => {
  state.db = new PGlite()
  for (const file of ['006_workshop_studio.sql', '007_workshop_studio_access.sql', '008_workshop_studio_submission.sql', '009_workshop_studio_quotes.sql', '010_workshop_studio_provider.sql']) {
    const sql = readFileSync(new URL('../db/migrations/' + file, import.meta.url), 'utf8')
    await state.db.exec(sql); await state.db.exec(sql)
  }
}, 30000)
beforeEach(async () => {
  state.enabled = true; state.failReceipt = false; state.afterClaim = null
  vi.clearAllMocks()
  await state.db.exec('truncate workshop_studio_cohorts cascade')
  cohortId = randomUUID(); seatId = randomUUID()
  await state.db.query(`insert into workshop_studio_cohorts (id,workshop_slug,session_starts_at,session_ends_at,access_opens_at,access_expires_at,paused)
    values ($1,'ai-video-editing','2026-11-06T17:00:00Z','2026-11-06T19:00:00Z','2026-11-05T17:00:00Z','2026-11-13T19:00:00Z',false)`, [cohortId])
  await state.db.query(`insert into workshop_studio_seats (id,cohort_id,ghl_calendar_id,ghl_registration_id,ghl_contact_id,registration_state)
    values ($1,$2,'video-calendar','registration-one','contact-one','eligible')`, [seatId, cohortId])
  state.provider = {
    estimate: vi.fn(async () => ({ maximumCostCents: 472, currency: 'USD', requestHash: studioRequestHash(request), correlationId: 'synthetic-account-price', providerPayload: payload })),
    submit: vi.fn(async () => ({ requestId: providerId, statusUrl, providerState: 'queued' })),
    status: vi.fn(async () => ({ requestId: providerId, providerState: 'completed', videoUrl, expiresAt: new Date('2026-11-13T17:00:00Z'), billingVerified: false })),
  }
})
afterAll(async () => { await state.db?.close() })

describe('disabled-by-default worker with synthetic provider and real local database', () => {
  it('does no work when the actual release gate is closed', async () => {
    state.enabled = false
    for (const operation of [() => dispatch({ id: randomUUID() }), () => poll({ id: randomUUID() })]) await expect(operation()).rejects.toMatchObject({ code: 'PROVIDER_DISABLED' })
    expect(state.provider.submit).not.toHaveBeenCalled(); expect(state.provider.status).not.toHaveBeenCalled()
  })
  it('commits the unknown hold before one POST and binds a durable private receipt atomically', async () => {
    const job = await reserve()
    state.provider.submit.mockImplementationOnce(async args => {
      expect((await row(job)).state).toBe('unknown')
      expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
      expect(args).toMatchObject({ idempotencyKey: job.id, request, providerPayload: payload })
      return { requestId: providerId, statusUrl, providerState: 'queued' }
    })
    expect(await dispatch(job)).toEqual({ jobId: job.id, dispatched: true, state: 'submitted' })
    expect(await row(job)).toMatchObject({ provider_job_id: providerId, provider_status_url: statusUrl, provider_state: 'queued', state: 'submitted' })
    expect(await dispatch(job)).toEqual({ jobId: job.id, dispatched: false })
    expect(state.provider.submit).toHaveBeenCalledTimes(1)
  })
  it('retains uncertain holds on timeout without exposing provider content or retrying', async () => {
    const job = await reserve()
    state.provider.submit.mockRejectedValueOnce(new Error('secret prompt and authorization'))
    expect(await dispatch(job)).toEqual({ jobId: job.id, dispatched: false, uncertain: true })
    expect(await dispatch(job)).toEqual({ jobId: job.id, dispatched: false })
    expect((await row(job)).state).toBe('unknown')
    expect(state.provider.submit).toHaveBeenCalledTimes(1)
  })
  it('permits only one simultaneous dispatcher to send the frozen request', async () => {
    const job = await reserve()
    const results = await Promise.all([dispatch(job),dispatch(job)])
    expect(results.filter(result => result.dispatched)).toHaveLength(1)
    expect(state.provider.submit).toHaveBeenCalledTimes(1)
  })
  it('rejects an acceptance URL from another provider/request without losing the hold', async () => {
    const job = await reserve()
    state.provider.submit.mockResolvedValueOnce({ requestId:providerId,statusUrl:'https://untrusted.example/status',providerState:'queued' })
    expect(await dispatch(job)).toMatchObject({ uncertain:true })
    expect(await row(job)).toMatchObject({ state:'unknown',provider_job_id:null,provider_status_url:null })
  })
  it('never resubmits when provider acceptance succeeded but receipt persistence failed', async () => {
    const job = await reserve(); state.failReceipt = true
    expect(await dispatch(job)).toMatchObject({ uncertain: true })
    expect(await row(job)).toMatchObject({ state: 'unknown', provider_job_id: null, provider_status_url: null })
    await dispatch(job)
    expect(state.provider.submit).toHaveBeenCalledTimes(1)
    expect((await getStudioUsage({ seatId })).seat.availableCents).toBe(28)
  })
  it('does not finalize provisional billing while a claimed dispatch lacks provider correlation', async () => {
    const job = await reserve()
    state.provider.submit.mockImplementationOnce(async () => {
      for (const cost of [0,100]) {
        await expect(reconcileGeneration({ jobId:job.id,outcome:cost ? 'charged' : 'uncharged',actualCostCents:cost,evidenceReference:'provisional-unbound-snapshot',now:NOW })).rejects.toMatchObject({ code:'BILLING_EVIDENCE_REQUIRED' })
      }
      expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
      return { requestId:providerId,statusUrl,providerState:'queued' }
    })
    expect(await dispatch(job)).toMatchObject({ dispatched:true })
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
    await reconcileGeneration({ jobId:job.id,outcome:'charged',actualCostCents:472,evidenceReference:'synthetic-exact-provider-billing',now:NOW })
    expect((await getStudioUsage({ seatId })).seat.spentCents).toBe(472)
  })
  it('rechecks an ownership change after claiming and before external submission', async () => {
    const job = await reserve()
    state.afterClaim = () => transferStudioSeat({ seatId, ghlContactId: 'replacement', ghlRegistrationId: 'replacement-registration', evidenceReference: 'verified-transfer', now: NOW })
    expect(await dispatch(job)).toMatchObject({ dispatched: false, uncertain: true })
    expect(state.provider.submit).not.toHaveBeenCalled()
    expect((await row(job)).state).toBe('unknown')
  })
  it('does not send an expired frozen quote even after a successful claim', async () => {
    const job = await reserve()
    vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW)
    state.afterClaim = () => vi.setSystemTime(new Date('2026-11-06T17:06:00Z'))
    try {
      expect(await dispatch(job, { now: undefined })).toMatchObject({ dispatched: false, uncertain: true })
      expect(state.provider.submit).not.toHaveBeenCalled()
    } finally { vi.useRealTimers() }
  })
  it('records completed output privately while retaining the entire held allowance', async () => {
    const job = await reserve(); await dispatch(job)
    expect(await poll(job)).toEqual({ jobId: job.id, providerState: 'completed', outputReady: true, billingVerified: false })
    expect(await row(job)).toMatchObject({ state: 'submitted', provider_state: 'completed', provider_video_url: videoUrl, actual_cost_cents: null })
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
    const learner = await getStudioLearnerJob({ seatId, accessVersion: 1, jobId: job.id, now: NOW })
    expect(JSON.stringify(learner)).not.toContain('private-')
    expect(learner).not.toHaveProperty('providerJobId')
  })
  it.each(['failed', 'canceled', 'nsfw'])('does not release funds for %s without independent billing evidence', async providerState => {
    const job = await reserve(); await dispatch(job)
    state.provider.status.mockResolvedValueOnce({ requestId: providerId, providerState, videoUrl: null, expiresAt: null, billingVerified: false })
    expect(await poll(job)).toMatchObject({ providerState, outputReady: false, billingVerified: false })
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
    expect((await row(job)).state).toBe('submitted')
  })
  it('continues status reconciliation after expiry/transfer without exposing a prior learner result', async () => {
    const job = await reserve(); await dispatch(job)
    await transferStudioSeat({ seatId, ghlContactId: 'replacement', ghlRegistrationId: 'replacement-registration', evidenceReference: 'verified-transfer', now: NOW })
    expect(await poll(job, { now: new Date('2026-11-14T17:00:00Z') })).toMatchObject({ providerState: 'completed' })
    expect(await getStudioLearnerJob({ seatId, accessVersion: 2, jobId: job.id, now: NOW })).toBeNull()
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
  })
  it('preserves a terminal receipt when a late active status arrives', async () => {
    const job = await reserve(); await dispatch(job); await poll(job)
    state.provider.status.mockResolvedValueOnce({ requestId: providerId, providerState: 'in_progress', videoUrl: null, expiresAt: null, billingVerified: false })
    expect(await poll(job)).toMatchObject({ providerState: 'completed', outputReady: true })
    expect((await row(job)).provider_video_url).toBe(videoUrl)
  })
  it('does not advertise expired or unknown-expiry provider outputs as ready', async () => {
    const job = await reserve(); await dispatch(job); await poll(job)
    expect(await poll(job,{ now:new Date('2026-11-13T17:00:00Z') })).toMatchObject({ outputReady:false })
    await state.db.query('update workshop_studio_jobs set provider_expires_at = null where id = $1',[job.id])
    state.provider.status.mockResolvedValueOnce({ requestId:providerId,providerState:'completed',videoUrl,expiresAt:null,billingVerified:true,actualCostCents:472 })
    expect(await poll(job)).toMatchObject({ outputReady:false,billingVerified:false })
    expect((await row(job)).actual_cost_cents).toBeNull()
  })
  it('never extends known output retention on a later status response', async () => {
    const job = await reserve(); await dispatch(job); await poll(job)
    state.provider.status.mockResolvedValueOnce({ requestId:providerId,providerState:'completed',videoUrl,expiresAt:new Date('2026-12-01T00:00:00Z') })
    await poll(job)
    expect(new Date((await row(job)).provider_expires_at).toISOString()).toBe('2026-11-13T17:00:00.000Z')
  })
  it('sanitizes status failures and preserves receipt/financial state for later GET reconciliation', async () => {
    const job = await reserve(); await dispatch(job)
    state.provider.status.mockRejectedValueOnce(new Error('secret authorization and private-url'))
    await expect(poll(job)).rejects.toMatchObject({ code:'PROVIDER_UNAVAILABLE' })
    expect(await row(job)).toMatchObject({ provider_state:'queued',state:'submitted',actual_cost_cents:null })
  })
  it('enforces complete provider receipt rows at the database boundary', async () => {
    const job = await reserve(); await dispatch(job)
    await expect(state.db.query('update workshop_studio_jobs set provider_state = null where id = $1',[job.id])).rejects.toThrow()
    await expect(state.db.query("update workshop_studio_jobs set provider_state = 'completed', provider_video_url = null where id = $1",[job.id])).rejects.toThrow()
  })
  it('keeps receipts and holds unchanged for conflicting identity, terminal outcome or unsafe output', async () => {
    const job = await reserve(); await dispatch(job)
    state.provider.status.mockResolvedValueOnce({ requestId: randomUUID(), providerState: 'completed', videoUrl, expiresAt: null })
    await expect(poll(job)).rejects.toMatchObject({ code: 'PROVIDER_BAD_RESPONSE' })
    state.provider.status.mockResolvedValueOnce({ requestId: providerId, providerState: 'completed', videoUrl: 'http://localhost/private', expiresAt: null })
    await expect(poll(job)).rejects.toMatchObject({ code: 'PROVIDER_BAD_RESPONSE' })
    await poll(job)
    state.provider.status.mockResolvedValueOnce({ requestId: providerId, providerState: 'failed', videoUrl: null, expiresAt: null })
    await expect(poll(job)).rejects.toMatchObject({ code: 'PROVIDER_CONFLICT' })
    expect((await row(job)).provider_state).toBe('completed')
    expect((await getStudioUsage({ seatId })).seat.heldCents).toBe(472)
  })
  it('does not call the provider if an unknown job has no durable provider receipt', async () => {
    const job = await reserve()
    expect(await poll(job)).toEqual({ jobId: job.id, providerState: null, outputReady: false, billingVerified: false })
    expect(state.provider.status).not.toHaveBeenCalled()
  })
  it('reapplies migration without changing a populated private provider receipt', async () => {
    const job = await reserve(); await dispatch(job); await poll(job)
    await state.db.exec(readFileSync(new URL('../db/migrations/010_workshop_studio_provider.sql', import.meta.url), 'utf8'))
    expect(await row(job)).toMatchObject({ provider_job_id: providerId, provider_video_url: videoUrl, state: 'submitted' })
  })
})
