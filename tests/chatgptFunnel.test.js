import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

const ghl = vi.hoisted(() => ({ upsertContact: vi.fn(), createOpportunity: vi.fn(), addContactNote: vi.fn() }))
vi.mock('../lib/ghl', () => ghl)
import { POST } from '../app/api/ghl/chatgpt-deployment-lead/route.js'
import { measure, identifyUser } from '../app/funnels/chatgpt-deployment/components/pixel.js'

const validLead = {
  firstName: 'Elliott', lastName: 'Example', email: 'visitor@example.com', company: 'Example Co', teamSize: '11–25',
}
const request = (body) => new Request('https://example.com/api/ghl/chatgpt-deployment-lead', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

beforeEach(() => {
  vi.clearAllMocks()
  ghl.upsertContact.mockResolvedValue({ contactId: 'contact_fixture' })
  ghl.createOpportunity.mockResolvedValue({ opportunityId: 'opportunity_fixture' })
  ghl.addContactNote.mockResolvedValue({ noteId: 'note_fixture' })
})
afterEach(() => vi.unstubAllGlobals())

describe('consultation lead capture', () => {
  it.each([null, [], { ...validLead, firstName: '' }, { ...validLead, company: {} }, { ...validLead, teamSize: 'invalid' }, { ...validLead, workflow: 'x'.repeat(4001) }])(
    'rejects invalid intake data before writing any GHL records', async (body) => {
      expect((await POST(request(body))).status).toBe(400)
      expect(ghl.upsertContact).not.toHaveBeenCalled()
    },
  )
  it('does not mark a honeypot submission as a real conversion', async () => {
    const response = await POST(request({ ...validLead, website: 'spam.example' }))
    expect(await response.json()).toMatchObject({ ok: true, accepted: false })
    expect(ghl.upsertContact).not.toHaveBeenCalled()
  })
  it('saves the workflow and campaign context along with the tagged contact', async () => {
    const response = await POST(request({ ...validLead, workflow: 'Weekly reports', utm: { utm_source: 'openai' }, eventId: 'lead_fixture' }))
    expect(await response.json()).toMatchObject({ ok: true, accepted: true })
    expect(ghl.upsertContact).toHaveBeenCalledWith(expect.objectContaining({ tags: ['chatgpt-deployment-funnel', 'source-openai'] }))
    expect(ghl.addContactNote).toHaveBeenCalledWith(expect.objectContaining({ body: expect.stringContaining('Weekly reports') }))
  })
})

describe('tracking failures', () => {
  it('never lets an SDK initialization failure break form success', async () => {
    vi.stubGlobal('window', { location: { search: '' }, oaiq: () => { throw new Error('SDK unavailable') } })
    expect(() => measure('lead_created', { type: 'customer_action' })).not.toThrow()
    await expect(identifyUser({ email: 'visitor@example.com' })).resolves.toBeUndefined()
  })
})
