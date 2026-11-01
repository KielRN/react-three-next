// Server-only protocol implementation. Production transport and generation gates
// are immutable false. No issuer, HTTP route, worker or live client invokes this.
import { fail, requireUuid } from './workshopStudioPolicy.js'
import { studioRequestHash, snapshotStudioRequest, canonicalStudioPayload, STUDIO_VIDEO_MODEL } from './workshopStudioProvider.js'
import { studioProviderTransportEnabled, studioReadiness } from './workshopStudioFeatures.js'

const origin = 'https://api.higgsfield.ai'
const states = new Set(['queued', 'in_progress', 'completed', 'failed', 'nsfw', 'canceled'])

function allowed(submitting = false) {
  if (!studioProviderTransportEnabled() || (submitting && !studioReadiness().providerSubmissionEnabled)) {
    fail('PROVIDER_DISABLED', 'Provider transport has not been activated.')
  }
}
function httpsUrl(value, code) {
  let url
  try { url = new URL(value) } catch { fail(code, 'A verified HTTPS URL is required.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || (url.port && url.port !== '443')) fail(code, 'A verified HTTPS URL is required.')
  return url
}
function statusEndpoint(requestId, value) {
  requireUuid(requestId)
  const url = httpsUrl(value, 'INVALID_PROVIDER_URL')
  if (url.origin !== origin || url.pathname !== `/requests/${requestId}/status` || url.search) fail('INVALID_PROVIDER_URL', 'Provider correlation URL mismatch.')
  return url.href
}
function cents(usd) {
  if (typeof usd !== 'string' || usd.length > 24 || !/^(0|[1-9]\d*)(\.\d{1,8})?$/.test(usd)) fail('PROVIDER_BAD_RESPONSE', 'Invalid provider estimate.')
  const [whole, fraction = ''] = usd.split('.')
  const scaled = BigInt(whole) * 100000000n + BigInt(fraction.padEnd(8, '0'))
  const result = (scaled * 100n + 99999999n) / 100000000n
  if (result > 1000000000n) fail('PROVIDER_BAD_RESPONSE', 'Unbounded provider estimate.')
  return Number(result)
}
async function readJson(response) {
  if (!response.headers.get('content-type')?.toLowerCase().startsWith('application/json')) fail('PROVIDER_BAD_RESPONSE', 'Expected provider JSON.')
  const reader = response.body?.getReader()
  if (!reader) fail('PROVIDER_BAD_RESPONSE', 'Empty provider response.')
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 65536) { await reader.cancel(); fail('PROVIDER_BAD_RESPONSE', 'Provider response too large.') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) } catch { fail('PROVIDER_BAD_RESPONSE', 'Invalid provider JSON.') }
}
function correlation(response) {
  const value = response.headers.get('x-correlation-id')
  return typeof value === 'string' && /^[\x21-\x7e]{1,200}$/.test(value) ? value : null
}
export function createStudioTransport({ fetchImpl = fetch, getCredentials = () => process.env.HF_CREDENTIALS || process.env.HIGGSFIELD_API_KEY,
  resolveReference, allowedReferenceOrigins = [] } = {}) {
  async function payload(request) {
    studioRequestHash(request)
    if (typeof resolveReference !== 'function') fail('REFERENCE_UNAVAILABLE', 'Private reference resolution is not configured.')
    let reference
    try { reference = await resolveReference(request.reference) } catch { fail('REFERENCE_UNAVAILABLE', 'Private reference could not be resolved.') }
    if (reference?.sha256 !== request.reference.sha256) fail('REFERENCE_MISMATCH', 'Reference content does not match the priced request.')
    const url = httpsUrl(reference.url, 'INVALID_REFERENCE')
    if (!allowedReferenceOrigins.includes(url.origin)) fail('INVALID_REFERENCE', 'Reference origin has not been accepted.')
    return { prompt: request.prompt, duration: request.duration, resolution: request.resolution, aspect_ratio: request.aspectRatio,
      output_format: request.outputFormat, generate_audio: request.generateAudio, video_urls: [url.href] }
  }
  async function call(url, { method, body, idempotencyKey, submitting = false }) {
    allowed(submitting)
    const key = getCredentials()
    if (typeof key !== 'string' || key.length > 512 || !/^[\x21-\x39\x3b-\x7e]+:[\x21-\x39\x3b-\x7e]+$/.test(key)) fail('PROVIDER_CREDENTIALS_UNAVAILABLE', 'Provider credentials are not configured.')
    const headers = { Authorization: `Key ${key}`, Accept: 'application/json' }
    if (body) headers['Content-Type'] = 'application/json'
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
    let response
    try {
      response = await fetchImpl(url, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}),
        redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(15000) })
    } catch { fail(submitting ? 'PROVIDER_UNCERTAIN' : 'PROVIDER_UNAVAILABLE', 'Provider response could not be confirmed.') }
    if (!response.ok) {
      const code = submitting && response.status >= 500 ? 'PROVIDER_UNCERTAIN' : 'PROVIDER_HTTP_ERROR'
      const error = Object.assign(new Error('Provider request could not be accepted.'), { code, httpStatus: response.status })
      throw error // Never echo the provider body, credentials, URLs or prompts.
    }
    let data
    try { data = await readJson(response) } catch { fail(submitting ? 'PROVIDER_UNCERTAIN' : 'PROVIDER_BAD_RESPONSE', 'Provider response could not be verified.') }
    return { data, correlationId: correlation(response) }
  }
  return {
    async estimate({ request }) {
      allowed()
      const snapshot = snapshotStudioRequest(request)
      const body = await payload(snapshot)
      const { data, correlationId } = await call(`${origin}/estimate/${STUDIO_VIDEO_MODEL}`, { method: 'POST', body })
      return { maximumCostCents: cents(data?.usd), currency: 'USD', requestHash: studioRequestHash(snapshot), correlationId,
        providerPayload: canonicalStudioPayload(snapshot, body) }
    },
    async submit({ request, idempotencyKey, providerPayload }) {
      allowed(true)
      requireUuid(idempotencyKey) // Persisted internal job UUID, not a browser key.
      const snapshot = snapshotStudioRequest(request)
      const body = providerPayload ? canonicalStudioPayload(snapshot, providerPayload) : await payload(snapshot)
      if (!allowedReferenceOrigins.includes(new URL(body.video_urls[0]).origin)) fail('INVALID_REFERENCE', 'Reference origin has not been accepted.')
      const { data, correlationId } = await call(`${origin}/${STUDIO_VIDEO_MODEL}`, { method: 'POST', body, idempotencyKey, submitting: true })
      if (!data || !['queued', 'in_progress'].includes(data.status) || typeof data.request_id !== 'string') fail('PROVIDER_BAD_RESPONSE', 'Invalid provider acceptance receipt; retain the hold.')
      let statusUrl
      try { statusUrl = statusEndpoint(data.request_id, data.status_url) } catch { fail('PROVIDER_BAD_RESPONSE', 'Invalid provider acceptance correlation; retain the hold.') }
      return { requestId: data.request_id, statusUrl, providerState: data.status, correlationId }
    },
    async status({ requestId, statusUrl }) {
      allowed()
      const url = statusEndpoint(requestId, statusUrl)
      const { data, correlationId } = await call(url, { method: 'GET' })
      if (!data || data.request_id !== requestId || !states.has(data.status)) fail('PROVIDER_BAD_RESPONSE', 'Invalid provider status correlation.')
      let videoUrl = null
      if (data.status === 'completed') {
        try { videoUrl = httpsUrl(data.video?.url, 'PROVIDER_BAD_RESPONSE').href } catch { fail('PROVIDER_BAD_RESPONSE', 'A completed result requires a verified output URL.') }
      }
      const expiresAt = data.expires_at == null ? null : new Date(data.expires_at)
      if (expiresAt && !Number.isFinite(expiresAt.getTime())) fail('PROVIDER_BAD_RESPONSE', 'Invalid output expiry.')
      // Status alone is not an independently read-back billing/refund receipt.
      return { requestId, providerState: data.status, videoUrl, expiresAt, correlationId, billingVerified: false }
    },
  }
}
