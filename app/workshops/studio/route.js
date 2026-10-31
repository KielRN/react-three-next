import { studioReadiness } from '../../../lib/workshopStudioFeatures.js'
import { studioDocument } from '../../../lib/workshopStudioDocument.js'
import { privateStudioResponse } from '../../../lib/workshopStudioHttp.js'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const headers = {
    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; worker-src 'none'",
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'X-Frame-Options': 'DENY',
    'Content-Type': 'text/html; charset=utf-8',
  }
  // Next's installed fetch-server-response falls back to full document
  // navigation for non-Flight/non-2xx responses. Never retain public-page gtag.
  if (req.headers.get('rsc') === '1') return privateStudioResponse(new Response('Document navigation required.', {
    status: 409, headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' },
  }))
  if (new URL(req.url).search) return privateStudioResponse(new Response('Use the studio address without query parameters.', { status: 400, headers }))
  return privateStudioResponse(new Response(studioDocument(studioReadiness().accessEnabled), { headers }))
}
