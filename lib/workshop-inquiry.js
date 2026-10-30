import { getWorkshop } from './workshops'

export function validateWorkshopInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Enter your inquiry details.' }
  const limits = { slug: 100, name: 100, email: 254, message: 2000, interest: 20, website: 200 }
  const data = {}
  for (const [key, limit] of Object.entries(limits)) {
    const value = input[key] ?? ''
    if (typeof value !== 'string' || value.length > limit)
      return { error: 'Check the length and format of your details.' }
    data[key] = value.trim()
  }
  if (data.website) return { error: 'Unable to accept this inquiry.' }
  if (!getWorkshop(data.slug)) return { error: 'Choose a workshop from the catalog.' }
  if (!data.name || /[\r\n\x00-\x1f]/.test(data.name)) return { error: 'Enter your name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: 'Enter a valid email address.' }
  if (!['public', 'private'].includes(data.interest)) return { error: 'Choose a public session or a private group.' }
  if (input.consent !== true) return { error: 'Confirm that we may contact you about this inquiry.' }
  data.email = data.email.toLowerCase()
  return { data }
}

export async function submitWorkshopInquiry(input, { upsertContact, addContactTags, addContactNote }) {
  const result = validateWorkshopInquiry(input)
  if (result.error) throw new Error(result.error)
  const data = result.data
  const [firstName, ...rest] = data.name.split(/\s+/)
  // Omitting tags here preserves the existing contact's unrelated tags.
  const { contactId } = await upsertContact({ email: data.email, firstName, lastName: rest.join(' ') })
  if (!contactId) throw new Error('Contact save was not confirmed.')
  await addContactTags(contactId, ['workshop-inquiry', `workshop-${data.slug}`])
  await addContactNote({
    contactId,
    body: [
      `Workshop inquiry: ${getWorkshop(data.slug).title}`,
      `Source: https://texasaiconsulting.com/workshops/${data.slug}`,
      `Interest: ${data.interest === 'private' ? 'Private group' : 'Next public session'}`,
      'Inquiry only; no seat reserved or payment collected.',
      'Permission: contact about this inquiry only; no marketing subscription requested.',
      data.message ? `Context: ${data.message}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  })
  return { status: 'inquiry_received' }
}
