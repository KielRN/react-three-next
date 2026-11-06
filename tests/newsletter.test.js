import { describe, expect, it, vi } from 'vitest'
import {
  CONSENT_TEXT,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  validateNewsletterSignup,
  validateUnsubscribe,
} from '../lib/newsletter'
import { submitWorkshopInquiry } from '../lib/workshop-inquiry'

const signup = { firstName: 'Alex', email: 'Alex@Example.com', consent: true, source: 'blog', page: '/blog/post' }
const deps = (existing = []) => ({
  searchContactsByEmail: vi.fn().mockResolvedValue(existing),
  upsertContact: vi.fn().mockResolvedValue({ contactId: 'new-1' }),
  addContactTags: vi.fn().mockResolvedValue({}),
  removeContactTags: vi.fn().mockResolvedValue({}),
  addContactNote: vi.fn().mockResolvedValue({}),
})

describe('newsletter signup validation', () => {
  it.each([
    { consent: false },
    { consent: 'true' },
    { email: 'nope' },
    { firstName: '' },
    { firstName: {} },
    { website: 'bot' },
  ])('rejects %j', (change) => {
    expect(validateNewsletterSignup({ ...signup, ...change }).error).toBeTruthy()
  })
  it('normalizes the email and falls back to the default source', () => {
    const { data } = validateNewsletterSignup({ ...signup, source: 'made-up', page: 'https://evil.example' })
    expect(data).toMatchObject({ email: 'alex@example.com', source: 'newsletter', page: '' })
  })
})

describe('subscribeToNewsletter', () => {
  it('creates a new contact without tags, then adds newsletter + source tags and a consent note', async () => {
    const d = deps()
    const result = await subscribeToNewsletter(
      { email: 'alex@example.com', firstName: 'Alex', source: 'blog', page: '/blog/post', consentText: CONSENT_TEXT },
      d,
      new Date('2026-11-05T18:00:00Z'),
    )
    expect(d.upsertContact).toHaveBeenCalledWith({ email: 'alex@example.com', firstName: 'Alex', lastName: '' })
    expect(d.upsertContact.mock.calls[0][0].tags).toBeUndefined()
    expect(d.addContactTags).toHaveBeenCalledWith('new-1', ['newsletter', 'newsletter-src-blog'])
    const note = d.addContactNote.mock.calls[0][0].body
    expect(note).toContain('2026-11-05T18:00:00.000Z')
    expect(note).toContain('https://texasaiconsulting.com/blog/post')
    expect(note).toContain(CONSENT_TEXT)
    expect(result).toMatchObject({ status: 'subscribed', alreadySubscribed: false, emailBlocked: false })
  })
  it('reuses the oldest existing record, keeps its tags and clears newsletter-unsubscribed', async () => {
    const d = deps([
      { id: 'newer', dateAdded: '2026-10-01T00:00:00Z', tags: [] },
      { id: 'older', dateAdded: '2026-01-01T00:00:00Z', tags: ['workshop-inquiry', 'newsletter-unsubscribed'] },
    ])
    await subscribeToNewsletter({ email: 'a@b.co', source: 'home', consentText: CONSENT_TEXT }, d)
    expect(d.upsertContact).not.toHaveBeenCalled()
    expect(d.removeContactTags).toHaveBeenCalledWith('older', ['newsletter-unsubscribed'])
    expect(d.addContactTags).toHaveBeenCalledWith('older', ['newsletter', 'newsletter-src-home'])
  })
  it('flags contacts GHL will not email instead of silently clearing DND', async () => {
    const d = deps([{ id: 'c1', dateAdded: '2026-01-01T00:00:00Z', tags: ['unsubscribed'], dndSettings: { Email: { status: 'active' } } }])
    const result = await subscribeToNewsletter({ email: 'a@b.co', source: 'home', consentText: CONSENT_TEXT }, d)
    expect(result.emailBlocked).toBe(true)
    expect(d.addContactNote.mock.calls[0][0].body).toContain('will not deliver')
  })
  it('never reports success when GHL fails', async () => {
    const d = deps()
    d.addContactTags.mockRejectedValue(new Error('down'))
    await expect(subscribeToNewsletter({ email: 'a@b.co', source: 'home', consentText: CONSENT_TEXT }, d)).rejects.toThrow('down')
  })
})

describe('workshop inquiry opt-in', () => {
  const inquiry = { slug: 'ai-video-editing', name: 'Alex Sample', email: 'alex@example.com', interest: 'public', consent: true }
  it('subscribes only when the box is checked', async () => {
    const d = { ...deps(), upsertContact: vi.fn().mockResolvedValue({ contactId: 'c1' }) }
    expect(await submitWorkshopInquiry(inquiry, d)).toEqual({ status: 'inquiry_received' })
    expect(d.addContactTags).not.toHaveBeenCalledWith('c1', expect.arrayContaining(['newsletter']))
    const d2 = { ...deps(), upsertContact: vi.fn().mockResolvedValue({ contactId: 'c1' }) }
    expect(await submitWorkshopInquiry({ ...inquiry, newsletter: true }, d2)).toEqual({
      status: 'inquiry_received',
      newsletter: 'subscribed',
    })
    expect(d2.addContactTags).toHaveBeenCalledWith('c1', ['newsletter', 'newsletter-src-workshop'])
  })
  it('keeps the inquiry when only the newsletter step fails', async () => {
    const d = { ...deps(), upsertContact: vi.fn().mockResolvedValue({ contactId: 'c1' }) }
    d.searchContactsByEmail.mockRejectedValue(new Error('search down'))
    expect(await submitWorkshopInquiry({ ...inquiry, newsletter: true }, d)).toEqual({
      status: 'inquiry_received',
      newsletter: 'failed',
    })
  })
})

describe('newsletter unsubscribe validation', () => {
  it('prefers a well-formed contact id from the email link', () => {
    expect(validateUnsubscribe({ contactId: 'TLAUMXxRDOZ63f9s435S', email: 'x@y.com' }).data).toEqual({
      contactId: 'TLAUMXxRDOZ63f9s435S',
      email: '',
    })
  })
  it('falls back to a typed email and normalizes it', () => {
    expect(validateUnsubscribe({ contactId: '../bad', email: ' Alex@Example.com ' }).data).toEqual({
      contactId: '',
      email: 'alex@example.com',
    })
  })
  it.each([null, [], {}, { email: 'nope' }, { contactId: 'short' }])('rejects %j', (input) => {
    expect(validateUnsubscribe(input).error).toBeTruthy()
  })
})

describe('unsubscribeFromNewsletter', () => {
  const unsubDeps = ({ byId = null, byEmail = [] } = {}) => ({
    getContact: vi.fn().mockResolvedValue(byId),
    searchContactsByEmail: vi.fn().mockResolvedValue(byEmail),
    addContactTags: vi.fn().mockResolvedValue({}),
    addContactNote: vi.fn().mockResolvedValue({}),
  })
  it('tags the linked contact newsletter-unsubscribed and notes it', async () => {
    const d = unsubDeps({ byId: { id: 'c1' } })
    const result = await unsubscribeFromNewsletter({ contactId: 'c1', email: '' }, d, new Date('2026-11-05T18:00:00Z'))
    expect(d.searchContactsByEmail).not.toHaveBeenCalled()
    expect(d.addContactTags).toHaveBeenCalledWith('c1', ['newsletter-unsubscribed'])
    expect(d.addContactNote.mock.calls[0][0].body).toContain('email link')
    expect(result).toEqual({ status: 'unsubscribed', matched: 1 })
  })
  it('tags every contact sharing a typed email', async () => {
    const d = unsubDeps({ byEmail: [{ id: 'a' }, { id: 'b' }] })
    await unsubscribeFromNewsletter({ contactId: '', email: 'alex@example.com' }, d)
    expect(d.addContactTags.mock.calls.map((call) => call[0])).toEqual(['a', 'b'])
  })
  it('changes nothing for an unknown contact id', async () => {
    const d = unsubDeps()
    expect(await unsubscribeFromNewsletter({ contactId: 'missing123', email: '' }, d)).toEqual({ status: 'unsubscribed', matched: 0 })
    expect(d.addContactTags).not.toHaveBeenCalled()
  })
})
