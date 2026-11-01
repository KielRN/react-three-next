// Instructor-only verification. This module is never imported by an app/client route.
export function estimateCents(usd, maximum) {
  if (!/^\d+(\.\d+)?$/.test(String(usd))) throw new Error('INVALID_ESTIMATE')
  const cents = Math.ceil(Number(usd) * 100)
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > maximum) throw new Error('ESTIMATE_EXCEEDS_PILOT_LIMIT')
  return cents
}

// This is an instructor-test planning estimate, NEVER a binding student quote.
export function pilotEstimate(response, kind) {
  if (response.usd !== undefined) return { usd: response.usd, source: 'account-usd-estimate', bindingPriceGuarantee: false }
  const rate = kind === 'smoke' ? '0.0214' : '0.01284'
  const completeRate = kind === 'smoke'
    ? 'Each 1,000 video tokens costs $0.0214 at 480p or 720p'
    : '$0.01284 per 1,000 tokens at 480p or 720p'
  if (response.type !== 'description' || typeof response.pricing_description !== 'string' || !response.pricing_description.includes(completeRate)) throw new Error('INVALID_ESTIMATE')
  const seconds = kind === 'smoke' ? 5 : 20 // Ten-second input + ten-second output.
  const tokens = Math.ceil(1280 * 720 * seconds * 24 / 1024)
  return { usd: (tokens * Number(rate) / 1000).toFixed(8), source: 'account-formula-planning-only', bindingPriceGuarantee: false, tokens, pricingDescription: response.pricing_description }
}

export function trustedStatusUrl(id, value = `https://api.higgsfield.ai/requests/${id}/status`) {
  if (!/^[a-zA-Z0-9-]{16,100}$/.test(id)) throw new Error('INVALID_REQUEST_ID')
  if (value !== `https://api.higgsfield.ai/requests/${id}/status`) throw new Error('INVALID_STATUS_URL')
  return value
}

export function terminalResult(body) {
  const status = body?.status
  if (['queued', 'in_progress'].includes(status)) return null
  if (['failed', 'canceled', 'cancelled', 'nsfw', 'moderated'].includes(status)) return { status }
  if (status !== 'completed') throw new Error('INVALID_PROVIDER_STATUS')
  const url = new URL(body.video?.url)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('INVALID_VIDEO_URL')
  return { status, videoUrl: url.href }
}

export function safeFailure(error) {
  const status = error?.response?.status ?? error?.httpStatus ?? error?.statusCode
  return {
    error: 'Provider request failed; inspect permissions or account state locally.',
    ...(Number.isInteger(status) && status >= 400 && status <= 599 ? { httpStatus: status } : {}),
  }
}
