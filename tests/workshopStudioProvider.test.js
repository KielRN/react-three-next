import { describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { studioRequestHash, validateStudioQuote, submitStudioGeneration } from '../lib/workshopStudioProvider.js'

const now = new Date('2026-11-06T17:00:00Z')
const request = { model: 'bytedance/seedance-2.5/reference-to-video', prompt: 'A single corridor sidestep.', duration: 10,
  resolution: '720p', aspectRatio: '16:9', outputFormat: 'mp4', generateAudio: false,
  reference: { assetId: 'class-reference-1', sha256: createHash('sha256').update('private reference').digest('hex') } }
const quote = () => ({ id: 'server-quote-1', requestHash: studioRequestHash(request), currency: 'USD', maximumCostCents: 200,
  includesReferenceInput: true, expiresAt: '2026-11-06T17:05:00Z' })

describe('disabled provider preparation and bounded exact-request quotes', () => {
  it('accepts a bounded server quote without treating it as spending authority', () => {
    expect(validateStudioQuote({ request, quote: quote(), now })).toMatchObject({ maximumCostCents: 200, requestHash: studioRequestHash(request) })
  })
  it.each([-1, 0, 0.5, Infinity, NaN, null, undefined, '200', 501])('rejects an invalid maximum: %s', (maximumCostCents) => {
    expect(() => validateStudioQuote({ request, quote: { ...quote(), maximumCostCents }, now })).toThrow()
  })
  it.each([
    { currency: 'EUR' }, { includesReferenceInput: false }, { expiresAt: now.toISOString() },
    { expiresAt: 'invalid' }, { requestHash: 'different' }, { id: '' },
  ])('rejects stale/unbound/unpriced reference quotes: %s', (change) => {
    expect(() => validateStudioQuote({ request, quote: { ...quote(), ...change }, now })).toThrow()
  })
  it.each([
    { duration: 11 }, { generateAudio: true }, { prompt: 'Another shot' },
    { reference: { ...request.reference, assetId: 'different-file' } },
    { reference: { ...request.reference, sha256: 'f'.repeat(64) } },
  ])('binds every priced input, including reference bytes: %s', (change) => {
    expect(() => validateStudioQuote({ request: { ...request, ...change }, quote: quote(), now })).toThrow()
  })
  it.each([
    { model: 'cheaper/text-to-video' }, { duration: 3 }, { duration: 30.5 }, { resolution: '360p' },
    { reference: { assetId: 'https://arbitrary.example/file', sha256: 'f'.repeat(64) } },
    { prompt: 'x'.repeat(4001) }, { video_urls: ['https://untrusted.example'] },
  ])('rejects unsupported input rather than silently dropping it: %s', (change) => {
    expect(() => studioRequestHash({ ...request, ...change })).toThrow()
  })
  it('never reads credentials, reserves money or performs a network request while disabled', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    vi.stubEnv('WORKSHOP_STUDIO_ENABLED', 'true')
    vi.stubEnv('HF_CREDENTIALS', 'not-a-real-key')
    try {
      await expect(submitStudioGeneration({ request, quote: quote(), paid: true, funded: true })).rejects.toMatchObject({ code: 'PROVIDER_DISABLED' })
      expect(fetch).not.toHaveBeenCalled()
    } finally { vi.unstubAllGlobals(); vi.unstubAllEnvs() }
  })
})
