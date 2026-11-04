import { describe, expect, it, vi } from 'vitest'
import {
  createRegistrationCheckout,
  findPaidRegistration,
  fulfillPaidRegistration,
  isRegistrationOpen,
  recordRefund,
  validateRegistration,
} from '../lib/workshop-registration'
import { WORKSHOP_FIELD_ID } from '../lib/workshop-inquiry'

const START = '2026-12-04T11:00:00-06:00'
const NOW = Date.parse('2026-11-04T15:00:00Z')
const meta = { source: 'workshop_registration', workshop: 'ai-video-editing', session_start: START }
const input = { slug: 'ai-video-editing', name: 'Alex Sample', email: 'Alex@Example.com', policy: true }

const paid = (id, extra = {}) => ({
  id,
  created: 100,
  metadata: meta,
  status: 'complete',
  payment_status: 'paid',
  payment_intent: { id: `pi_${id}`, latest_charge: { refunded: false } },
  customer_details: { email: 'alex@example.com' },
  livemode: false,
  ...extra,
})
const open = (id, created = 200) => ({ id, created, metadata: meta, status: 'open', expires_at: NOW / 1000 + 600 })

function fakeStripe(sessions) {
  const store = [...sessions]
  return {
    store,
    prices: { list: vi.fn().mockResolvedValue({ data: [{ id: 'price_video' }] }) },
    customers: { list: vi.fn().mockResolvedValue({ data: [{ id: 'cus_1' }] }), create: vi.fn() },
    checkout: {
      sessions: {
        list: vi.fn(() => (async function* () { yield* store })()),
        create: vi.fn(async () => {
          const created = { ...open('cs_new', 300), client_secret: 'secret_new' }
          store.push(created)
          return created
        }),
        expire: vi.fn().mockResolvedValue({}),
      },
    },
    paymentIntents: { retrieve: vi.fn(), update: vi.fn().mockResolvedValue({}) },
  }
}

const ghlDeps = (contacts = []) => ({
  searchContactsByEmail: vi.fn().mockResolvedValue(contacts),
  upsertContact: vi.fn().mockResolvedValue({ contactId: 'new-contact' }),
  updateContactCustomFields: vi.fn().mockResolvedValue({}),
  addContactTags: vi.fn().mockResolvedValue({}),
  removeContactTags: vi.fn().mockResolvedValue({}),
  addContactNote: vi.fn().mockResolvedValue({}),
})

describe('workshop registration', () => {
  it('opens only listed slugs that have an upcoming session', () => {
    expect(isRegistrationOpen('ai-video-editing', { WORKSHOP_REGISTRATION_OPEN: 'ai-video-editing' })).toBe(true)
    expect(isRegistrationOpen('ai-marketing', { WORKSHOP_REGISTRATION_OPEN: 'ai-video-editing' })).toBe(false)
    expect(isRegistrationOpen('ai-video-editing', {})).toBe(false)
  })

  it.each([{ slug: 'nope' }, { email: 'bad' }, { policy: false }, { policy: 'true' }, { name: '' }])(
    'rejects invalid registration fields: %j',
    (change) => expect(validateRegistration({ ...input, ...change }).error).toBeTruthy(),
  )

  it('starts checkout with metadata, a lookup-key price and a 31-minute seat hold', async () => {
    const stripe = fakeStripe([paid('cs_a')])
    const { data } = validateRegistration(input)
    const result = await createRegistrationCheckout(stripe, { data, origin: 'http://localhost:3000', now: NOW })
    expect(result).toEqual({ status: 'checkout', clientSecret: 'secret_new' })
    expect(stripe.prices.list).toHaveBeenCalledWith({ lookup_keys: ['workshop_ai-video-editing_2026-12-04'], active: true })
    const args = stripe.checkout.sessions.create.mock.calls[0][0]
    expect(args).toMatchObject({ mode: 'payment', ui_mode: 'embedded_page', metadata: meta, allow_promotion_codes: false })
    expect(args.payment_intent_data.metadata).toEqual(meta)
    expect(args.expires_at).toBe(NOW / 1000 + 31 * 60)
    expect(args.return_url).toBe('http://localhost:3000/workshops/ai-video-editing/registered?session_id={CHECKOUT_SESSION_ID}')
  })

  it('reports sold out at capacity without creating a session; refunded and expired seats do not count', async () => {
    const full = Array.from({ length: 12 }, (_, i) => (i < 11 ? paid(`cs_${i}`) : open('cs_hold')))
    const stripe = fakeStripe(full)
    const { data } = validateRegistration(input)
    expect(await createRegistrationCheckout(stripe, { data, origin: 'x', now: NOW })).toEqual({ status: 'sold_out' })
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()

    const freed = fakeStripe([
      ...full.slice(0, 10),
      paid('cs_refunded', { payment_intent: { id: 'pi_r', latest_charge: { refunded: true } } }),
      { ...open('cs_old'), expires_at: NOW / 1000 - 1 },
      paid('cs_other', { metadata: { ...meta, workshop: 'ai-marketing' } }),
    ])
    expect((await createRegistrationCheckout(freed, { data, origin: 'x', now: NOW })).status).toBe('checkout')
  })

  it('expires its own session when a concurrent buyer took the last seat first', async () => {
    const stripe = fakeStripe(Array.from({ length: 11 }, (_, i) => paid(`cs_${i}`)))
    stripe.checkout.sessions.create.mockImplementation(async () => {
      stripe.store.push(open('cs_rival', 250), { ...open('cs_new', 300), client_secret: 's' })
      return { id: 'cs_new', client_secret: 's' }
    })
    const { data } = validateRegistration(input)
    expect(await createRegistrationCheckout(stripe, { data, origin: 'x', now: NOW })).toEqual({ status: 'sold_out' })
    expect(stripe.checkout.sessions.expire).toHaveBeenCalledWith('cs_new')
  })

  it('fulfills on the oldest matching GHL contact, field before tag, and records completion', async () => {
    const stripe = fakeStripe([])
    stripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', metadata: {} })
    const ghl = ghlDeps([
      { id: 'newer', dateAdded: '2026-11-04T00:00:00Z' },
      { id: 'oldest', dateAdded: '2026-01-01T00:00:00Z' },
    ])
    const checkout = { ...paid('cs_1'), payment_intent: 'pi_1', amount_total: 4900, customer_details: { email: 'Alex@example.com', name: 'Alex Sample' } }
    expect(await fulfillPaidRegistration(stripe, ghl, checkout)).toEqual({ status: 'fulfilled', contactId: 'oldest' })
    expect(ghl.upsertContact).not.toHaveBeenCalled()
    expect(ghl.updateContactCustomFields).toHaveBeenCalledWith('oldest', [{ id: WORKSHOP_FIELD_ID, field_value: 'AI Video Editing' }])
    expect(ghl.addContactTags).toHaveBeenCalledWith('oldest', ['workshop-registrant', 'workshop-paid-ai-video-editing'])
    expect(ghl.updateContactCustomFields.mock.invocationCallOrder[0]).toBeLessThan(ghl.addContactTags.mock.invocationCallOrder[0])
    expect(ghl.addContactNote.mock.calls[0][0].body).toContain('Stripe TEST mode')
    expect(stripe.paymentIntents.update).toHaveBeenCalledWith('pi_1', { metadata: { ghl_contact_id: 'oldest' } })
  })

  it('creates a contact only when none exists, and skips repeats and unrelated checkouts', async () => {
    const stripe = fakeStripe([])
    stripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', metadata: {} })
    const ghl = ghlDeps([])
    const checkout = { ...paid('cs_1'), payment_intent: 'pi_1', amount_total: 4900, customer_details: { email: 'a@b.co', name: 'Alex Sample' } }
    expect((await fulfillPaidRegistration(stripe, ghl, checkout)).contactId).toBe('new-contact')
    expect(ghl.upsertContact).toHaveBeenCalledWith({ email: 'a@b.co', firstName: 'Alex', lastName: 'Sample' })

    stripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', metadata: { ghl_contact_id: 'new-contact' } })
    expect(await fulfillPaidRegistration(stripe, ghl, checkout)).toEqual({ status: 'already_fulfilled' })
    expect(await fulfillPaidRegistration(stripe, ghl, { metadata: { source: 'reviews_funnel' } })).toEqual({ status: 'ignored' })
  })

  it('swaps tags on a full refund once', async () => {
    const stripe = fakeStripe([])
    stripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_1', metadata: { ...meta, ghl_contact_id: 'c1' } })
    const ghl = ghlDeps()
    const charge = { refunded: true, payment_intent: 'pi_1', amount_refunded: 4900, livemode: false }
    expect(await recordRefund(stripe, ghl, charge)).toEqual({ status: 'recorded', contactId: 'c1' })
    expect(ghl.removeContactTags).toHaveBeenCalledWith('c1', ['workshop-paid-ai-video-editing'])
    expect(ghl.addContactTags).toHaveBeenCalledWith('c1', ['workshop-refunded-ai-video-editing'])
    expect(await recordRefund(stripe, ghl, { ...charge, refunded: false })).toEqual({ status: 'ignored' })
  })

  it('finds a paid, unrefunded order for studio eligibility by email and session', async () => {
    const stripe = fakeStripe([
      paid('cs_refunded', { payment_intent: { id: 'pi_r', latest_charge: { refunded: true } } }),
      paid('cs_good'),
    ])
    expect(await findPaidRegistration(stripe, { email: ' ALEX@example.com', slug: 'ai-video-editing' })).toEqual({
      checkoutId: 'cs_good',
      paymentIntentId: 'pi_cs_good',
      livemode: false,
    })
    expect(await findPaidRegistration(stripe, { email: 'someone@else.com', slug: 'ai-video-editing' })).toBeNull()
  })
})
