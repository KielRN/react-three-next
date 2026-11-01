import { describe, expect, it } from 'vitest'
import { estimateSeedanceReferenceCost } from '../lib/workshopStudioPricing.js'

describe('published Seedance reference-input arithmetic, not an account quote', () => {
  const settings = { width: 1280, height: 720, referenceDurationMs: 10000, outputDurationMs: 10000 }
  it('counts input plus output and rounds the monetary reservation upward', () => {
    expect(estimateSeedanceReferenceCost(settings)).toMatchObject({ billableTokens: 432000, estimatedCents: 555, fitsLearnerCap: false, authoritativeQuote: false })
  })
  it('can price a shorter output without changing the reference or approved cap', () => {
    expect(estimateSeedanceReferenceCost({ ...settings, outputDurationMs: 8000 })).toMatchObject({ billableTokens: 388800, estimatedCents: 500, fitsLearnerCap: true })
    expect(estimateSeedanceReferenceCost({ ...settings, referenceDurationMs: 8000, outputDurationMs: 8000 })).toMatchObject({ estimatedCents: 444 })
  })
  it.each([0, -1, 10.1, Infinity, null, undefined, '10000'])('rejects unbounded/noninteger reference duration: %s', (referenceDurationMs) => {
    expect(() => estimateSeedanceReferenceCost({ ...settings, referenceDurationMs })).toThrow()
  })
  it('does not extrapolate this rate into a different resolution or unsupported duration', () => {
    expect(() => estimateSeedanceReferenceCost({ ...settings, width: 1920, height: 1080 })).toThrow()
    expect(() => estimateSeedanceReferenceCost({ ...settings, outputDurationMs: 3000 })).toThrow()
  })
})
