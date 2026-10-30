import { describe, expect, it, vi } from 'vitest'
import { validateWorkshopInquiry, submitWorkshopInquiry } from '../lib/workshop-inquiry'

const input = {
  slug: 'ai-video-editing',
  name: 'Alex Sample',
  email: 'Alex@example.com',
  interest: 'public',
  message: 'Interested in the next date',
  consent: true,
}
const dependencies = () => ({
  upsertContact: vi.fn().mockResolvedValue({ contactId: 'contact-1' }),
  addContactTags: vi.fn().mockResolvedValue({}),
  addContactNote: vi.fn().mockResolvedValue({}),
})

describe('workshop inquiry', () => {
  it.each([
    { slug: 'unselected' },
    { email: 'invalid' },
    { consent: false },
    { consent: 'true' },
    { name: {} },
    { email: [] },
    { message: 'a'.repeat(2001) },
    { interest: 'paid' },
    { website: 'spam' },
  ])('rejects invalid inquiry fields: %j', (change) => {
    expect(validateWorkshopInquiry({ ...input, ...change }).error).toBeTruthy()
  })
  it('normalizes identity and accepts a bounded optional message', () => {
    const result = validateWorkshopInquiry({ ...input, name: ' Alex Sample ', email: ' Alex@example.com ' })
    expect(result.data.email).toBe('alex@example.com')
    expect(result.data.name).toBe('Alex Sample')
  })
  it('adds topic tags without replacing existing tags or enrolling in a workflow', async () => {
    const deps = dependencies()
    expect(await submitWorkshopInquiry(input, deps)).toEqual({ status: 'inquiry_received' })
    expect(deps.upsertContact).toHaveBeenCalledWith({
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Sample',
    })
    expect(deps.addContactTags).toHaveBeenCalledWith('contact-1', ['workshop-inquiry', 'workshop-ai-video-editing'])
    expect(deps.addContactNote.mock.calls[0][0].body).toContain('Inquiry only; no seat reserved or payment collected.')
  })
  it('never reports success when GHL fails', async () => {
    const deps = dependencies()
    deps.addContactNote.mockRejectedValue(new Error('upstream unavailable'))
    await expect(submitWorkshopInquiry(input, deps)).rejects.toThrow('upstream unavailable')
  })
  it('does not write invalid input or a malformed upstream contact', async () => {
    const deps = dependencies()
    await expect(submitWorkshopInquiry({ ...input, consent: false }, deps)).rejects.toThrow()
    expect(deps.upsertContact).not.toHaveBeenCalled()
    deps.upsertContact.mockResolvedValue({})
    await expect(submitWorkshopInquiry(input, deps)).rejects.toThrow()
    expect(deps.addContactTags).not.toHaveBeenCalled()
  })
  it('matches an existing contact and uses additive topic tags on repeated interest', async () => {
    const deps = dependencies()
    await submitWorkshopInquiry(input, deps)
    await submitWorkshopInquiry({ ...input, slug: 'ai-marketing' }, deps)
    expect(deps.addContactTags.mock.calls[1]).toEqual(['contact-1', ['workshop-inquiry', 'workshop-ai-marketing']])
  })
})
