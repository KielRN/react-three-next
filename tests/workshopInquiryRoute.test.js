import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/ghl', () => ({ upsertContact: vi.fn(), addContactTags: vi.fn(), addContactNote: vi.fn() }))
import { upsertContact, addContactTags, addContactNote } from '../lib/ghl'
import { POST } from '../app/api/workshop-inquiry/route'

const payload = {
  slug: 'ai-video-editing',
  name: 'Alex Sample',
  email: 'alex@example.com',
  interest: 'public',
  consent: true,
}
const request = (body, headers = {}) =>
  new Request('https://texasaiconsulting.com/api/workshop-inquiry', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  })

beforeEach(() => {
  vi.resetAllMocks()
  upsertContact.mockResolvedValue({ contactId: 'contact-1' })
  addContactTags.mockResolvedValue({})
  addContactNote.mockResolvedValue({ noteId: 'note-1' })
})

describe('workshop inquiry HTTP boundary', () => {
  it.each([
    [request('{bad-json'), 400],
    [request([]), 400],
    [request(payload, { origin: 'https://unrelated.example' }), 403],
    [request(payload, { 'Content-Type': 'text/plain' }), 415],
    [request('x'.repeat(8193)), 413],
    [request({ ...payload, consent: false }), 400],
  ])('rejects malformed requests without a CRM write', async (req, status) => {
    expect((await POST(req)).status).toBe(status)
    expect(upsertContact).not.toHaveBeenCalled()
  })
  it('returns inquiry_received only after all GHL writes succeed', async () => {
    const response = await POST(request(payload, { origin: 'https://texasaiconsulting.com' }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'inquiry_received' })
    expect(addContactNote).toHaveBeenCalledWith(expect.objectContaining({ contactId: 'contact-1' }))
  })
  it('accepts the public site origin behind a container reverse proxy', async () => {
    const req = new Request('http://0.0.0.0:8080/api/workshop-inquiry', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://texasaiconsulting.com',
        Host: 'texasaiconsulting.com',
        'X-Forwarded-Proto': 'https',
      },
    })
    expect((await POST(req)).status).toBe(200)
  })
  it('returns a safe failure for a partial save', async () => {
    addContactTags.mockRejectedValue(new Error('secret CRM response'))
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await POST(request(payload))
    expect(response.status).toBe(502)
    expect(JSON.stringify(await response.json())).not.toContain('secret CRM response')
    expect(addContactNote).not.toHaveBeenCalled()
    log.mockRestore()
  })
})
