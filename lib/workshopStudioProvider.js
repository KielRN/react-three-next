import { createHash } from 'node:crypto'
import { fail, requireReference, requireTime } from './workshopStudioPolicy.js'

export const STUDIO_VIDEO_MODEL = 'bytedance/seedance-2.5/reference-to-video'
const keys = ['model', 'prompt', 'duration', 'resolution', 'aspectRatio', 'outputFormat', 'generateAudio', 'reference']

export function snapshotStudioRequest(request) {
  studioRequestHash(request)
  const snapshot = Object.freeze({ ...request, reference: Object.freeze({ ...request.reference }) })
  studioRequestHash(snapshot)
  return snapshot
}

// Canonical order survives jsonb storage. The model ID remains fixed server-side.
export function canonicalStudioPayload(request, payload) {
  studioRequestHash(request)
  const fields = ['prompt','duration','resolution','aspect_ratio','output_format','generate_audio','video_urls']
  if (!payload || Object.keys(payload).length !== fields.length || Object.keys(payload).some((k) => !fields.includes(k)) ||
      payload.prompt !== request.prompt || payload.duration !== request.duration || payload.resolution !== request.resolution ||
      payload.aspect_ratio !== request.aspectRatio || payload.output_format !== request.outputFormat || payload.generate_audio !== request.generateAudio ||
      !Array.isArray(payload.video_urls) || payload.video_urls.length !== 1 || typeof payload.video_urls[0] !== 'string') {
    fail('QUOTE_MISMATCH', 'Provider payload does not match the priced request.')
  }
  let url
  try { url = new URL(payload.video_urls[0]) } catch { fail('QUOTE_MISMATCH', 'Invalid private reference URL.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || (url.port && url.port !== '443')) fail('QUOTE_MISMATCH', 'Invalid private reference URL.')
  return Object.freeze({ prompt: payload.prompt, duration: payload.duration, resolution: payload.resolution, aspect_ratio: payload.aspect_ratio,
    output_format: payload.output_format, generate_audio: payload.generate_audio, video_urls: Object.freeze([...payload.video_urls]) })
}
export function studioPayloadHash(request, payload) {
  return createHash('sha256').update(JSON.stringify(canonicalStudioPayload(request, payload))).digest('hex')
}

// Internal draft contract, not a funded offer. Reference IDs must be resolved
// server-side to isolated assets; browser-provided/public URLs are not accepted.
export function studioRequestHash(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request) || Object.keys(request).length !== keys.length ||
      Object.keys(request).some((key) => !keys.includes(key)) || request.model !== STUDIO_VIDEO_MODEL ||
      typeof request.prompt !== 'string' || !request.prompt.trim() || request.prompt.length > 4000 ||
      !Number.isInteger(request.duration) || request.duration < 4 || request.duration > 30 ||
      !['480p', '720p', '1080p'].includes(request.resolution) ||
      !['16:9', '4:3', '1:1', '3:4', '9:16', '21:9'].includes(request.aspectRatio) ||
      !['mp4', 'mov'].includes(request.outputFormat) || typeof request.generateAudio !== 'boolean' ||
      !request.reference || Object.keys(request.reference).length !== 2 ||
      typeof request.reference.assetId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(request.reference.assetId) ||
      typeof request.reference.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(request.reference.sha256)) {
    fail('INVALID_PROVIDER_INPUT', 'A supported exact shot and private reference fingerprint are required.')
  }
  // Fixed field order prevents object-key order from changing idempotency.
  const canonical = keys.map((key) => key === 'reference'
    ? [request.reference.assetId, request.reference.sha256] : request[key])
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex')
}

// Call only with a server-stored quote from a verified billing source. This
// validator binds content/cost; it does not establish who issued a quote.
export function validateStudioQuote({ request, quote, now }) {
  const time = requireTime(now)
  const requestHash = studioRequestHash(request)
  requireReference(quote?.id, 'INVALID_QUOTE')
  const expiresAt = new Date(quote.expiresAt)
  if (quote.currency !== 'USD' || !Number.isSafeInteger(quote.maximumCostCents) || quote.maximumCostCents < 1 ||
      quote.maximumCostCents > 500 || quote.includesReferenceInput !== true || quote.requestHash !== requestHash ||
      !Number.isFinite(expiresAt.getTime()) || expiresAt <= time) {
    fail('INVALID_QUOTE', 'A fresh bounded USD quote including reference-input billing is required.')
  }
  return { quoteId: quote.id, requestHash, maximumCostCents: quote.maximumCostCents, currency: 'USD', expiresAt }
}

export async function submitStudioGeneration() {
  // Deliberately no SDK/fetch/credential reader or caller-controlled enable flag.
  // Real lifecycle transport, billing proof and pilot spending need acceptance.
  fail('PROVIDER_DISABLED', 'Provider submission has not been activated.')
}
