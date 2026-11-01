import { fail, STUDIO_LEARNER_CAP_CENTS } from './workshopStudioPolicy.js'

// Published pre-discount 720p reference-video rate, checked October31,2026.
// Planning arithmetic ONLY. The authenticated /estimate response is required
// before a server quote can be issued; this is not authority to spend.
export function estimateSeedanceReferenceCost({ width, height, referenceDurationMs, outputDurationMs }) {
  if (width !== 1280 || height !== 720 || !Number.isSafeInteger(referenceDurationMs) || referenceDurationMs < 1 || referenceDurationMs > 30000 ||
      !Number.isSafeInteger(outputDurationMs) || outputDurationMs < 4000 || outputDurationMs > 30000 || outputDurationMs % 1000 !== 0) {
    fail('UNSUPPORTED_PRICE_INPUT', 'Use the prepared 1280x720 shot with bounded verified durations.')
  }
  const ceil = (numerator, denominator) => (numerator + denominator - 1n) / denominator
  const tokens = ceil(BigInt(width) * BigInt(height) * BigInt(referenceDurationMs + outputDurationMs) * 24n, 1024000n)
  // USD0.01284 /1000 tokens =1284/1,000,000 cents per token.
  const estimatedCents = Number(ceil(tokens * 1284n, 1000000n))
  return { billableTokens: Number(tokens), estimatedCents, currency: 'USD',
    fitsLearnerCap: estimatedCents <= STUDIO_LEARNER_CAP_CENTS, authoritativeQuote: false,
    source: 'https://open.higgsfield.ai/models/bytedance/seedance-2.5/reference-to-video/playground' }
}
