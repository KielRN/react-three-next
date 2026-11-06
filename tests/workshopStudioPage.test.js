import { describe, expect, it } from 'vitest'
import { GET } from '../app/workshops/studio/route.js'
import privateStudioRequest from '../lib/workshopStudioCache.cjs'
import { studioDocument } from '../lib/workshopStudioDocument.js'

describe('standalone private studio document', () => {
  it('bypasses the marketing layout and forbids tracking, frames and shared caching', async () => {
    const response = await GET(new Request('https://texasaiconsulting.com/workshops/studio'))
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('referrer-policy')).toBe('no-referrer')
    expect(response.headers.get('x-robots-tag')).toContain('noindex')
    const csp = response.headers.get('content-security-policy')
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(html).not.toMatch(/gtag|googletagmanager|dataLayer|_next\/static/)
    expect(html).toContain('data-access-enabled="false"')
    expect(html).toContain('Studio access is not open yet')
    expect(html).toContain('method="post" action="/api/workshop-studio/session"')
    expect(html).not.toContain('name="code"')
  })
  it('forces a document boundary for Next client navigation without returning credentials', async () => {
    const response = await GET(new Request('https://texasaiconsulting.com/workshops/studio?_rsc=test', { headers: { RSC: '1' } }))
    expect(response.status).toBe(409)
    expect(response.headers.get('content-type')).toContain('text/plain')
    expect(await response.text()).not.toContain('code')
  })
  it('rejects URL credentials without echoing them', async () => {
    const response = await GET(new Request('https://texasaiconsulting.com/workshops/studio?code=secret'))
    expect(response.status).toBe(400)
    expect(await response.text()).not.toContain('secret')
  })
  it('prepares a hidden empty result list without putting file URLs or credentials in HTML',()=>{
    const html=studioDocument(true)
    expect(html).toContain('id="results"')
    expect(html).toContain('id="result-list"')
    expect(html).toContain('id="refresh-results"')
    expect(html).not.toMatch(/provider_video_url|cloudfront|signature=|name="token"/)
    expect(html).toContain('Generation unavailable')
  })
  it.each(['/workshops/studio', '/workshops/studio/', '/api/workshop-studio/session', '/api/workshop-studio/jobs/job','/api/workshop-studio/jobs','/api/workshop-studio/jobs/job/download'])('keeps private data network-only in the PWA: %s', (path) => {
    expect(privateStudioRequest({ sameOrigin: true, url: new URL('https://texasaiconsulting.com' + path) })).toBe(true)
  })
  it.each(['/workshops/%73tudio', '/api/workshop%2Dstudio/session', '/api/workshop-studio%2Fjobs/id/download', '/workshops/studio?code=ignored', '/api/workshop-studio%2F..%2Fsession'])('keeps encoded aliases and private queries out of shared caches: %s', (path) => {
    expect(privateStudioRequest({ sameOrigin: true, url: new URL('https://texasaiconsulting.com' + path) })).toBe(true)
  })
  it('does not change public workshop caching or unrelated origins', () => {
    expect(privateStudioRequest({ sameOrigin: true, url: new URL('https://texasaiconsulting.com/workshops') })).toBe(false)
    expect(privateStudioRequest({ sameOrigin: false, url: new URL('https://other.example/workshops/studio') })).toBe(false)
  })
})
