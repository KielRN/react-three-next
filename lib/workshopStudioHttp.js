import { NextResponse } from 'next/server'
import { fail } from './workshopStudioPolicy.js'

export const STUDIO_COOKIE = '__Host-txai_studio'
const origins = new Set(['https://texasaiconsulting.com', 'https://www.texasaiconsulting.com'])

export function privateStudioResponse(response) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}
export function studioJson(body, status = 200) { return privateStudioResponse(NextResponse.json(body, { status })) }

export function studioFailure(error) {
  const statuses = { INVALID_ID: 400, INVALID_BODY: 400, INVALID_REQUEST: 400, INVALID_TIME: 400, INVALID_ACCESS: 401,
    FORBIDDEN: 403, ACCESS_REVOKED: 403, ACCESS_CLOSED: 403, ACCESS_PAUSED: 403, REGISTRATION_INELIGIBLE: 403,
    NOT_FOUND: 404, BODY_TOO_LARGE: 413, UNSUPPORTED_MEDIA: 415 }
  const status = statuses[error?.code] || 503
  const message = status === 401 ? 'Studio access is invalid or expired.'
    : status === 403 ? 'Studio access is not permitted.'
      : status === 404 ? 'Studio record not found.'
        : status < 500 ? 'The studio request could not be accepted.' : 'Studio access is not available yet.'
  return studioJson({ error: message }, status)
}

export function checkStudioRead(req) {
  // Tokens, codes, prompts and file URLs must never be supplied in query strings.
  if (new URL(req.url).search) fail('INVALID_REQUEST', 'Query parameters are not accepted.')
  if (req.headers.get('sec-fetch-site') === 'cross-site') fail('FORBIDDEN', 'Cross-site request denied.')
  const origin = req.headers.get('origin')
  if (origin && !origins.has(origin)) fail('FORBIDDEN', 'Origin denied.')
}
export function checkStudioMutation(req) {
  checkStudioRead(req)
  if (!origins.has(req.headers.get('origin'))) fail('FORBIDDEN', 'Same-origin request required.')
}

export function studioToken(req) {
  const values = (req.headers.get('cookie') || '').split(';').map((part) => part.trim()).filter((part) => part.startsWith(`${STUDIO_COOKIE}=`))
  return values.length === 1 ? values[0].slice(STUDIO_COOKIE.length + 1) : null
}
export function setStudioCookie(response, session) {
  response.headers.set('Set-Cookie', `${STUDIO_COOKIE}=${session.token}; Path=/; Expires=${session.expiresAt.toUTCString()}; HttpOnly; Secure; SameSite=Strict`)
  return response
}
export function clearStudioCookie(response) {
  response.headers.set('Set-Cookie', `${STUDIO_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`)
  return response
}

export async function readStudioCode(req) {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') fail('UNSUPPORTED_MEDIA', 'JSON required.')
  const reader = req.body?.getReader()
  if (!reader) fail('INVALID_BODY', 'Code required.')
  const chunks = []
  let total = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > 1024) { await reader.cancel(); fail('BODY_TOO_LARGE', 'Body too large.') }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  let body
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) } catch { fail('INVALID_BODY', 'Invalid JSON.') }
  if (!body || Array.isArray(body) || typeof body !== 'object' || Object.keys(body).length !== 1 ||
      typeof body.code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.code)) fail('INVALID_BODY', 'Code required.')
  return body.code
}
