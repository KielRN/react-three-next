import { getWorkshop, getWorkshopSession, workshopLookupKey } from './workshops'
import { WORKSHOP_FIELD_ID } from './workshop-inquiry'
import { OPT_IN_TEXT, subscribeToNewsletter } from './newsletter'

// Paid workshop registration: Stripe Embedded Checkout on our own page, then a
// Stripe webhook writes the GHL contact. Stripe is the order record; GHL holds the
// contact, tags and the tag-triggered fulfillment workflow (emails, reminders, alert).

export const REGISTRATION_SOURCE = 'workshop_registration'
// Checkout sessions created before this are ignored when counting seats.
const SALES_OPENED_AT = Math.floor(Date.parse('2026-11-01T00:00:00Z') / 1000)
// Stripe's minimum Checkout lifetime is 30 minutes; an open session holds a seat until it expires.
const HOLD_SECONDS = 31 * 60

export const paidTag = (slug) => `workshop-paid-${slug}`
export const refundedTag = (slug) => `workshop-refunded-${slug}`

// Registration opens per slug (comma list) so a session can be tested before it is public.
export function isRegistrationOpen(slug, env = process.env) {
  const open = (env.WORKSHOP_REGISTRATION_OPEN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return open.includes(slug) && Boolean(getWorkshopSession(slug))
}

export function validateRegistration(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Enter your registration details.' }
  const limits = { slug: 100, name: 100, email: 254 }
  const data = {}
  for (const [key, limit] of Object.entries(limits)) {
    const value = input[key] ?? ''
    if (typeof value !== 'string' || value.length > limit) return { error: 'Check the length and format of your details.' }
    data[key] = value.trim()
  }
  if (!getWorkshop(data.slug)) return { error: 'Choose a workshop from the catalog.' }
  if (!data.name || /[\r\n\x00-\x1f]/.test(data.name)) return { error: 'Enter your name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: 'Enter a valid email address.' }
  if (input.policy !== true) return { error: 'Confirm that you have read the cancellation policy.' }
  if (input.newsletter !== undefined && typeof input.newsletter !== 'boolean')
    return { error: 'Check the newsletter option and try again.' }
  data.email = data.email.toLowerCase()
  data.newsletter = input.newsletter === true
  return { data }
}

function belongsTo(checkout, session) {
  const meta = checkout.metadata || {}
  return meta.source === REGISTRATION_SOURCE && meta.workshop === session.slug && meta.session_start === session.start
}

function isRefunded(checkout) {
  return Boolean(checkout.payment_intent?.latest_charge?.refunded)
}

// Seats taken = paid and not fully refunded, plus open checkouts that still hold a seat.
// Returned oldest first so a race over the last seat has one deterministic loser.
export async function listSeatHolders(stripe, session, now = Date.now()) {
  const holders = []
  const list = stripe.checkout.sessions.list({
    created: { gte: SALES_OPENED_AT },
    limit: 100,
    expand: ['data.payment_intent.latest_charge'],
  })
  for await (const checkout of list) {
    if (!belongsTo(checkout, session)) continue
    const paid = checkout.status === 'complete' && checkout.payment_status === 'paid' && !isRefunded(checkout)
    const holding = checkout.status === 'open' && checkout.expires_at * 1000 > now
    if (paid || holding) holders.push({ id: checkout.id, created: checkout.created, paid })
  }
  return holders.sort((a, b) => a.created - b.created || a.id.localeCompare(b.id))
}

export async function getSeatAvailability(stripe, slug) {
  const workshop = getWorkshop(slug)
  const session = getWorkshopSession(slug)
  if (!workshop || !session) return null
  const holders = await listSeatHolders(stripe, session)
  return { capacity: workshop.capacity, taken: holders.length, remaining: Math.max(0, workshop.capacity - holders.length) }
}

export async function createRegistrationCheckout(stripe, { data, origin, now = Date.now() }) {
  const workshop = getWorkshop(data.slug)
  const session = getWorkshopSession(data.slug, now)
  if (!session) return { status: 'closed' }

  const prices = await stripe.prices.list({ lookup_keys: [workshopLookupKey(session)], active: true })
  const price = prices.data[0]
  if (!price) throw new Error(`No active Stripe price for ${workshopLookupKey(session)}.`)

  if ((await listSeatHolders(stripe, session, now)).length >= workshop.capacity) return { status: 'sold_out' }

  const existing = await stripe.customers.list({ email: data.email, limit: 1 })
  const customer =
    existing.data[0] ||
    (await stripe.customers.create({ email: data.email, name: data.name, metadata: { source: REGISTRATION_SOURCE } }))

  const metadata = { source: REGISTRATION_SOURCE, workshop: session.slug, session_start: session.start }
  // The newsletter opt-in rides on the Checkout Session only; the webhook acts on it after payment.
  const checkout = await stripe.checkout.sessions.create({
    ui_mode: 'embedded_page',
    mode: 'payment',
    customer: customer.id,
    customer_update: { name: 'auto' },
    line_items: [{ price: price.id, quantity: 1 }],
    payment_method_types: ['card'],
    allow_promotion_codes: Boolean(workshop.veteranPriceUSD),
    expires_at: Math.floor(now / 1000) + HOLD_SECONDS,
    return_url: `${origin}/workshops/${session.slug}/registered?session_id={CHECKOUT_SESSION_ID}`,
    metadata: data.newsletter ? { ...metadata, newsletter: 'yes' } : metadata,
    payment_intent_data: { metadata, description: `${workshop.title} workshop, ${session.start.slice(0, 10)}` },
  })

  // Two buyers can pass the first check together; the later holder past capacity gives way.
  const holders = await listSeatHolders(stripe, session, now)
  const position = holders.findIndex((holder) => holder.id === checkout.id)
  if (position >= workshop.capacity) {
    await stripe.checkout.sessions.expire(checkout.id)
    return { status: 'sold_out' }
  }
  return { status: 'checkout', clientSecret: checkout.client_secret }
}

// Several GHL contacts can share one email (the location allows duplicates).
// Use the oldest so every registration lands on the same record.
async function resolveContact(ghl, { email, name }) {
  const matches = await ghl.searchContactsByEmail(email)
  if (matches.length) {
    return [...matches].sort((a, b) => Date.parse(a.dateAdded) - Date.parse(b.dateAdded))[0].id
  }
  const [firstName, ...rest] = (name || '').split(/\s+/)
  const { contactId } = await ghl.upsertContact({ email, firstName, lastName: rest.join(' ') })
  return contactId
}

export async function fulfillPaidRegistration(stripe, ghl, checkout) {
  if (checkout.metadata?.source !== REGISTRATION_SOURCE) return { status: 'ignored' }
  if (checkout.payment_status !== 'paid') return { status: 'unpaid' }
  const paymentIntent = await stripe.paymentIntents.retrieve(checkout.payment_intent)
  if (paymentIntent.metadata?.ghl_contact_id) return { status: 'already_fulfilled' }

  const { workshop: slug, session_start: start } = checkout.metadata
  const workshop = getWorkshop(slug)
  const email = checkout.customer_details?.email?.toLowerCase()
  if (!workshop || !email) throw new Error('Paid checkout is missing its workshop or email.')

  const contactId = await resolveContact(ghl, { email, name: checkout.customer_details?.name })
  // The field is saved before the tag: the tag-triggered workflow reads {{contact.workshop}}.
  await ghl.updateContactCustomFields(contactId, [{ id: WORKSHOP_FIELD_ID, field_value: workshop.title }])
  await ghl.addContactTags(contactId, ['workshop-registrant', paidTag(slug)])
  await ghl.addContactNote({
    contactId,
    body: [
      `Paid workshop registration: ${workshop.title}`,
      `Session: ${start} (America/Chicago)`,
      `Paid: $${(checkout.amount_total / 100).toFixed(2)} USD${checkout.livemode ? '' : ' (Stripe TEST mode)'}`,
      `Stripe checkout: ${checkout.id}`,
      `Stripe payment: ${paymentIntent.id}`,
    ].join('\n'),
  })
  if (checkout.metadata.newsletter === 'yes') {
    // Best effort: a newsletter problem must never block or replay a paid registration.
    try {
      await subscribeToNewsletter(
        { email, source: 'workshop', page: `/workshops/${slug}/register`, consentText: OPT_IN_TEXT },
        ghl,
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[workshops-webhook] newsletter opt-in not saved:', err.message)
    }
  }
  await stripe.paymentIntents.update(paymentIntent.id, { metadata: { ghl_contact_id: contactId } })
  return { status: 'fulfilled', contactId }
}

export async function recordRefund(stripe, ghl, charge) {
  if (!charge.refunded || !charge.payment_intent) return { status: 'ignored' }
  const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent)
  const { source, workshop: slug, ghl_contact_id: contactId, ghl_refund_recorded } = paymentIntent.metadata || {}
  if (source !== REGISTRATION_SOURCE) return { status: 'ignored' }
  if (ghl_refund_recorded) return { status: 'already_recorded' }
  if (!contactId) throw new Error('Refunded registration has no GHL contact yet; retry after fulfillment.')

  await ghl.removeContactTags(contactId, [paidTag(slug)])
  await ghl.addContactTags(contactId, [refundedTag(slug)])
  await ghl.addContactNote({
    contactId,
    body: [
      `Workshop refund: ${getWorkshop(slug)?.title || slug}`,
      `Refunded: $${(charge.amount_refunded / 100).toFixed(2)} USD${charge.livemode ? '' : ' (Stripe TEST mode)'}`,
      `Stripe payment: ${paymentIntent.id}`,
      'Seat released.',
    ].join('\n'),
  })
  await stripe.paymentIntents.update(paymentIntent.id, { metadata: { ghl_refund_recorded: 'true' } })
  return { status: 'recorded', contactId }
}

// The order record studio access reads: a paid, unrefunded checkout for this email and session.
export async function findPaidRegistration(stripe, { email, slug }) {
  const session = getWorkshopSession(slug, 0)
  if (!session) return null
  const wanted = email.trim().toLowerCase()
  const list = stripe.checkout.sessions.list({
    created: { gte: SALES_OPENED_AT },
    status: 'complete',
    limit: 100,
    expand: ['data.payment_intent.latest_charge'],
  })
  for await (const checkout of list) {
    if (!belongsTo(checkout, session) || checkout.payment_status !== 'paid' || isRefunded(checkout)) continue
    if (checkout.customer_details?.email?.toLowerCase() === wanted) {
      return { checkoutId: checkout.id, paymentIntentId: checkout.payment_intent.id, livemode: checkout.livemode }
    }
  }
  return null
}
