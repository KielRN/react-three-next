import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/adminAuth.js', () => ({ requireAdmin: vi.fn() }))
vi.mock('../lib/workshopStudioAccess.js', () => ({ authenticateStudioSession: vi.fn(), exchangeStudioCode: vi.fn(), revokeStudioSession: vi.fn(), getStudioLearnerJob: vi.fn() }))
vi.mock('../lib/workshopStudioStore.js', () => ({ getStudioUsage: vi.fn() }))
vi.mock('../lib/workshopStudioFeatures.js', () => ({
  studioAccessEnabled: vi.fn(() => true),
  studioReadiness: () => ({ accessEnabled: false, provisioningEnabled: false, providerSubmissionEnabled: false, nativePaymentBindingAccepted: false }),
}))
import { requireAdmin } from '../lib/adminAuth.js'
import { authenticateStudioSession, exchangeStudioCode, revokeStudioSession, getStudioLearnerJob } from '../lib/workshopStudioAccess.js'
import { getStudioUsage } from '../lib/workshopStudioStore.js'
import { studioAccessEnabled } from '../lib/workshopStudioFeatures.js'
import { GET as ownerStatus, POST as provision } from '../app/api/admin/workshop-studio/route.js'
import { GET as ownerSeat } from '../app/api/admin/workshop-studio/[seatId]/route.js'
import { GET as sessionStatus, POST as exchange, DELETE as logout } from '../app/api/workshop-studio/session/route.js'
import { GET as learnerJob } from '../app/api/workshop-studio/jobs/[jobId]/route.js'

const origin = 'https://texasaiconsulting.com'
const seatId = '11111111-1111-4111-8111-111111111111'
const jobId = '22222222-2222-4222-8222-222222222222'
const code = 'a'.repeat(43)
const cookie = `__Host-txai_studio=${code}`
const request = (path = '/api/workshop-studio/session', options = {}) => new Request(origin + path, options)
const post = (body = { code }, extra = {}) => request('/api/workshop-studio/session', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...extra }, body: JSON.stringify(body),
})
function privateResponse(response) {
  expect(response.headers.get('cache-control')).toContain('no-store')
  expect(response.headers.get('referrer-policy')).toBe('no-referrer')
}
beforeEach(() => {
  vi.clearAllMocks()
  studioAccessEnabled.mockReturnValue(true)
  requireAdmin.mockResolvedValue({ uid: 'owner', email: 'owner@example.com' })
  authenticateStudioSession.mockResolvedValue({ seatId, accessVersion: 3 })
  getStudioUsage.mockResolvedValue({ seat: { availableCents: 500, accessVersion: 3 } })
  exchangeStudioCode.mockResolvedValue({ token: code, expiresAt: new Date('2026-11-13T19:00:00Z') })
  getStudioLearnerJob.mockResolvedValue({ id: jobId, state: 'reserved' })
})

describe('owner studio routes', () => {
  it.each([401, 403])('requires owner authorization first on every route: %s', async (status) => {
    requireAdmin.mockResolvedValue({ error: new Response('{}', { status }) })
    for (const response of [await ownerStatus(request()), await provision(post()), await ownerSeat(request(), { params: { seatId } })]) {
      expect(response.status).toBe(status)
      privateResponse(response)
    }
    expect(getStudioUsage).not.toHaveBeenCalled()
  })
  it('shows readiness but cannot provision via a supplied paid/enabled flag', async () => {
    const status = await ownerStatus(request())
    expect(await status.json()).toMatchObject({ provisioningEnabled: false, nativePaymentBindingAccepted: false })
    const response = await provision(post({ paid: true, enabled: true, seatId }))
    expect(response.status).toBe(503)
    expect(exchangeStudioCode).not.toHaveBeenCalled()
    privateResponse(response)
  })
  it('validates seat IDs, scopes the owner read and hides database errors', async () => {
    expect((await ownerSeat(request(), { params: { seatId: 'bad' } })).status).toBe(400)
    expect(getStudioUsage).not.toHaveBeenCalled()
    expect((await ownerSeat(request(), { params: { seatId } })).status).toBe(200)
    expect(getStudioUsage).toHaveBeenCalledWith({ seatId })
    getStudioUsage.mockRejectedValueOnce(new Error('secret database detail'))
    const response = await ownerSeat(request(), { params: { seatId } })
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('secret')
  })
})

describe('learner studio routes', () => {
  it('exchanges only the code into a secure HTTP-only host cookie', async () => {
    const response = await exchange(post())
    expect(response.status).toBe(200)
    const header = response.headers.get('set-cookie')
    for (const required of ['__Host-txai_studio=', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/']) expect(header).toContain(required)
    expect(header).not.toContain('Domain=')
    expect(await response.text()).not.toContain(code)
    expect(exchangeStudioCode).toHaveBeenCalledWith({ code })
    privateResponse(response)
  })
  it.each([undefined, 'https://evil.example', 'null'])('denies a missing/foreign Origin before exchanging: %s', async (value) => {
    const req = post()
    if (value === undefined) req.headers.delete('origin')
    else req.headers.set('origin', value)
    const response = await exchange(req)
    expect(response.status).toBe(403)
    expect(exchangeStudioCode).not.toHaveBeenCalled()
    privateResponse(response)
  })
  it.each([null, [], { code, paid: true }, { code, seatId }, { code: 12 }])('rejects malformed/client authority fields: %s', async (body) => {
    expect((await exchange(post(body))).status).toBe(400)
    expect(exchangeStudioCode).not.toHaveBeenCalled()
  })
  it('rejects oversized, malformed or wrong-type JSON', async () => {
    expect((await exchange(post({ code: 'x'.repeat(4000) }))).status).toBe(413)
    expect((await exchange(post({ code }, { 'Content-Type': 'text/plain' }))).status).toBe(415)
    expect((await exchange(request('/api/workshop-studio/session', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' }))).status).toBe(400)
    expect(exchangeStudioCode).not.toHaveBeenCalled()
  })
  it('denies access while the release gate is off, with no database/credential operation', async () => {
    studioAccessEnabled.mockReturnValue(false)
    const response = await exchange(post())
    expect(response.status).toBe(503)
    expect(exchangeStudioCode).not.toHaveBeenCalled()
  })
  it('takes seat identity only from the session and does not accept admin Bearer as learner access', async () => {
    const response = await sessionStatus(request('/api/workshop-studio/session', { headers: { Cookie: cookie } }))
    expect(response.status).toBe(200)
    expect(authenticateStudioSession).toHaveBeenCalledWith({ token: code })
    expect(getStudioUsage).toHaveBeenCalledWith({ seatId, accessVersion: 3 })
    privateResponse(response)
    authenticateStudioSession.mockRejectedValueOnce(Object.assign(new Error('no session'), { code: 'INVALID_ACCESS' }))
    expect((await sessionStatus(request('/api/workshop-studio/session', { headers: { Authorization: 'Bearer owner-token' } }))).status).toBe(401)
    expect(authenticateStudioSession).toHaveBeenLastCalledWith({ token: null })
  })
  it('rejects URL credentials, duplicate cookies and cross-site reads', async () => {
    expect((await sessionStatus(request(`/api/workshop-studio/session?token=${code}`))).status).toBe(400)
    expect((await sessionStatus(request('/api/workshop-studio/session', { headers: { 'Sec-Fetch-Site': 'cross-site', Cookie: cookie } }))).status).toBe(403)
    expect(authenticateStudioSession).not.toHaveBeenCalled()
    await sessionStatus(request('/api/workshop-studio/session', { headers: { Cookie: cookie + '; ' + cookie } }))
    expect(authenticateStudioSession).toHaveBeenLastCalledWith({ token: null })
  })
  it('scopes a job read by session version and returns safe 404/error responses', async () => {
    const req = request(`/api/workshop-studio/jobs/${jobId}`, { headers: { Cookie: cookie } })
    const response = await learnerJob(req, { params: { jobId } })
    expect(response.status).toBe(200)
    expect(getStudioLearnerJob).toHaveBeenCalledWith({ seatId, accessVersion: 3, jobId })
    getStudioLearnerJob.mockResolvedValueOnce(null)
    expect((await learnerJob(req, { params: { jobId } })).status).toBe(404)
    authenticateStudioSession.mockRejectedValueOnce(new Error('secret provider/key detail'))
    const failure = await learnerJob(req, { params: { jobId } })
    expect(failure.status).toBe(503)
    expect(await failure.text()).not.toContain('secret')
  })
  it('requires same-origin logout and clears the cookie', async () => {
    const req = request('/api/workshop-studio/session', { method: 'DELETE', headers: { Origin: origin, Cookie: cookie } })
    const response = await logout(req)
    expect(revokeStudioSession).toHaveBeenCalledWith({ token: code })
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
    privateResponse(response)
    req.headers.set('origin', 'https://evil.example')
    expect((await logout(req)).status).toBe(403)
  })
  it('clears the browser cookie even when logout persistence fails', async () => {
    revokeStudioSession.mockRejectedValueOnce(new Error('database unavailable'))
    const response = await logout(request('/api/workshop-studio/session', { method: 'DELETE', headers: { Origin: origin, Cookie: cookie } }))
    expect(response.status).toBe(503)
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
  })
  it.each([
    ['/api/workshop-studio/session', 'https://evil.example', 403],
    ['/api/workshop-studio/session?code=invalid', origin, 400],
  ])('does not mutate cookies on a rejected logout request: %s', async (path, requestOrigin, status) => {
    const response = await logout(request(path, { method: 'DELETE', headers: { Origin: requestOrigin, Cookie: cookie } }))
    expect(response.status).toBe(status)
    expect(response.headers.get('set-cookie')).toBeNull()
    expect(revokeStudioSession).not.toHaveBeenCalled()
  })
})
