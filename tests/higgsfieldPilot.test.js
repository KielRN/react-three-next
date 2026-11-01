import { describe, expect, it } from 'vitest'
import { estimateCents, pilotEstimate, safeFailure, terminalResult, trustedStatusUrl } from '../scripts/higgsfield/pilot.mjs'

describe('funded instructor pilot boundaries', () => {
  it('labels formula estimates as nonbinding and refuses unrecognized pricing', () => {
    expect(pilotEstimate({ type: 'description', pricing_description: 'Each 1,000 video tokens costs $0.0214 at 480p or 720p' }, 'smoke')).toMatchObject({ usd: '2.31120000', bindingPriceGuarantee: false, source: 'account-formula-planning-only' })
    expect(pilotEstimate({ type: 'description', pricing_description: '$0.01284 per 1,000 tokens at 480p or 720p' }, 'reference')).toMatchObject({ usd: '5.54688000', bindingPriceGuarantee: false })
    expect(() => pilotEstimate({ type: 'description', pricing_description: 'new rate' }, 'smoke')).toThrow()
  })
  it('rejects changed rate prefixes or billing units before any paid submission', () => {
    for (const pricing_description of ['Each 1,000 video tokens costs $0.02149 at 480p or 720p', '$0.0214 per token']) {
      expect(() => pilotEstimate({ type: 'description', pricing_description }, 'smoke')).toThrow()
    }
    expect(() => pilotEstimate({ type: 'description', pricing_description: '$0.012849 per 1,000 tokens at 480p or 720p' }, 'reference')).toThrow()
  })
  it('rounds account USD upward and rejects invalid or over-budget estimates', () => {
    expect(estimateCents('4.992192', 500)).toBe(500)
    for (const usd of ['5.54688', '-1', 'NaN', '0', '1e3']) {
      expect(() => estimateCents(usd, 500)).toThrow()
    }
  })
  it('accepts only the exact API status endpoint for the saved request', () => {
    const id = '30e44029-0bcc-4ce4-b2d0-258f10d79dcd'
    expect(trustedStatusUrl(id, `https://api.higgsfield.ai/requests/${id}/status`)).toContain(id)
    for (const url of ['https://evil.example/status', `https://api.higgsfield.ai/requests/${id}/status?token=x`, `https://x:y@api.higgsfield.ai/requests/${id}/status`]) {
      expect(() => trustedStatusUrl(id, url)).toThrow()
    }
  })
  it('requires completed plus a safe video URL, and handles every terminal failure', () => {
    expect(terminalResult({ status: 'completed', video: { url: 'https://cdn.example/video.mp4' } })).toEqual({ status: 'completed', videoUrl: 'https://cdn.example/video.mp4' })
    for (const status of ['failed', 'canceled', 'cancelled', 'nsfw', 'moderated']) {
      expect(terminalResult({ status, video: { url: 'https://cdn.example/video.mp4' } })).toEqual({ status })
    }
    expect(terminalResult({ status: 'queued' })).toBeNull()
    expect(terminalResult({ status: 'in_progress' })).toBeNull()
    expect(() => terminalResult({ status: 'completed' })).toThrow()
    expect(() => terminalResult({ status: 'completed', video: { url: 'javascript:bad' } })).toThrow()
    expect(() => terminalResult({ status: 'unknown-vendor-state' })).toThrow()
  })
  it('never returns raw provider errors, headers, response bodies or secrets', () => {
    const error = Object.assign(new Error('SECRET'), { name: 'AxiosError', config: { headers: { Authorization: 'SECRET' } }, response: { status: 401, data: 'SECRET' } })
    expect(safeFailure(error)).toEqual({ error: 'Provider request failed; inspect permissions or account state locally.', httpStatus: 401 })
    expect(JSON.stringify(safeFailure(error))).not.toContain('SECRET')
  })
})
