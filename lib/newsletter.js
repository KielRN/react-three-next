// Texas AI Weekly signups. GHL holds the list: adding the `newsletter` tag (plus a source tag)
// triggers the GHL welcome workflow, which sends the guide. The website sends no email itself.

export const NEWSLETTER_TAG = 'newsletter'
export const UNSUBSCRIBED_TAG = 'newsletter-unsubscribed'
export const NEWSLETTER_SOURCES = ['newsletter', 'home', 'blog', 'linkedin', 'article', 'invite', 'workshop', 'chatgpt-deployment']
export const CONSENT_TEXT =
  'Send me Texas AI Weekly, a free Thursday email from Elliott Lamboy about Texas + AI. I can unsubscribe anytime.'
export const OPT_IN_TEXT = 'Also send me Texas AI Weekly, a free Thursday email on Texas + AI. Unsubscribe anytime.'

export const sourceTag = (source) => `newsletter-src-${source}`

export function newsletterSource(value, fallback = 'newsletter') {
  return NEWSLETTER_SOURCES.includes(value) ? value : fallback
}

export function validateNewsletterSignup(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Enter your name and email.' }
  const limits = { firstName: 100, email: 254, source: 40, page: 300, website: 200 }
  const data = {}
  for (const [key, limit] of Object.entries(limits)) {
    const value = input[key] ?? ''
    if (typeof value !== 'string' || value.length > limit) return { error: 'Check the length and format of your details.' }
    data[key] = value.trim()
  }
  if (data.website) return { error: 'Unable to accept this signup.' }
  if (!data.firstName || /[\r\n\x00-\x1f]/.test(data.firstName)) return { error: 'Enter your first name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: 'Enter a valid email address.' }
  if (input.consent !== true) return { error: 'Check the box to confirm you want Texas AI Weekly.' }
  if (data.page && !data.page.startsWith('/')) data.page = ''
  data.email = data.email.toLowerCase()
  data.source = newsletterSource(data.source)
  return { data }
}

// Several GHL contacts can share one email (the location allows duplicates); use the oldest,
// the same record workshop registration uses.
function oldest(contacts) {
  return [...contacts].sort((a, b) => Date.parse(a.dateAdded) - Date.parse(b.dateAdded))[0]
}

function emailBlocked(contact) {
  return Boolean(contact?.dnd) || contact?.dndSettings?.Email?.status === 'active' || (contact?.tags || []).includes('unsubscribed')
}

export async function subscribeToNewsletter({ email, firstName = '', lastName = '', source, page = '', consentText }, ghl, now = new Date()) {
  const existing = oldest(await ghl.searchContactsByEmail(email))
  let contactId = existing?.id
  if (!contactId) {
    // No tags here: upsert with tags replaces a contact's tags, so tags are added separately.
    ;({ contactId } = await ghl.upsertContact({ email, firstName, lastName }))
  }
  if (!contactId) throw new Error('Contact save was not confirmed.')
  const tags = existing?.tags || []
  if (tags.includes(UNSUBSCRIBED_TAG)) await ghl.removeContactTags(contactId, [UNSUBSCRIBED_TAG])
  await ghl.addContactTags(contactId, [NEWSLETTER_TAG, sourceTag(source)])
  const blocked = emailBlocked(existing)
  await ghl.addContactNote({
    contactId,
    body: [
      'Texas AI Weekly signup',
      `Time: ${now.toISOString()}`,
      `Page: https://texasaiconsulting.com${page || '/newsletter'}`,
      `Source: ${sourceTag(source)}`,
      `Consent: checked "${consentText}"`,
      blocked
        ? 'Note: this contact has email DND or the unsubscribed tag, so GHL will not deliver the newsletter until that is reviewed and cleared by hand.'
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
  })
  return { status: 'subscribed', contactId, alreadySubscribed: tags.includes(NEWSLETTER_TAG), emailBlocked: blocked }
}
