import { createServer } from 'node:http'
import Stripe from 'stripe'
import { describe, expect, it, vi } from 'vitest'
import { readStudioStripeOrderEvidence } from '../lib/workshopStudioStripeEvidence.js'
import { verifyStudioRegistration } from '../lib/workshopStudioEligibility.js'
import { checkStudioRegistrationProof } from '../lib/workshopStudioPolicy.js'

const NOW = new Date('2026-12-05T18:00:00Z') // After class: payment evidence must not use the future-only catalog helper.
function fixture(slug = 'ai-video-editing') {
  const career = slug === 'from-resume-to-revenue'
  const start = career ? '2027-01-08T11:00:00-06:00' : '2026-12-04T11:00:00-06:00'
  const binding = { accountId: 'acct_fixture', livemode: false, checkoutSessionId: 'cs_test_fixture',
    paymentIntentId: 'pi_fixture', chargeId: 'ch_fixture', customerId: 'cus_fixture', purchaserContactId: 'original-contact',
    workshopSlug: slug, sessionStart: start, priceId: 'price_fixture', productId: 'prod_fixture',
    veteranPromotionId: career ? 'promo_veteran' : null, veteranCouponId: career ? 'coupon-fixture' : null }
  const meta = { source: 'workshop_registration', workshop: slug, session_start: start }
  const account = { id: binding.accountId, object: 'account' }
  const checkout = { id: binding.checkoutSessionId, object: 'checkout.session', livemode: false, status: 'complete',
    mode: 'payment', payment_status: 'paid', customer: binding.customerId, payment_intent: binding.paymentIntentId,
    metadata: { ...meta }, currency: 'usd', amount_subtotal: 4900, amount_total: 4900,
    total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 }, discounts: [],
    customer_details: { email: 'must-not-export@example.test', name: 'Private name' }, client_secret: 'never-export-this' }
  const items = { object: 'list', has_more: false, data: [{ id: 'li_fixture', object: 'item', quantity: 1, currency: 'usd',
    amount_subtotal: 4900, amount_total: 4900, amount_discount: 0, amount_tax: 0,
    price: { id: binding.priceId, object: 'price', product: binding.productId, livemode: false, currency: 'usd',
      unit_amount: 4900, type: 'one_time', billing_scheme: 'per_unit', recurring: null, transform_quantity: null,
      custom_unit_amount: null, lookup_key: `workshop_${slug}_${start.slice(0, 10)}` } }] }
  const intent = { id: binding.paymentIntentId, object: 'payment_intent', livemode: false, status: 'succeeded',
    amount: 4900, amount_received: 4900, currency: 'usd', customer: binding.customerId, latest_charge: binding.chargeId,
    metadata: { ...meta, ghl_contact_id: binding.purchaserContactId } }
  const charge = { id: binding.chargeId, object: 'charge', livemode: false, status: 'succeeded', paid: true, captured: true,
    amount: 4900, amount_captured: 4900, amount_refunded: 0, refunded: false, currency: 'usd', disputed: false, review: null,
    payment_intent: binding.paymentIntentId, customer: binding.customerId }
  const refunds = { object: 'list', has_more: false, data: [] }
  const stripe = { accounts: { retrieve: vi.fn(async () => account) },
    checkout: { sessions: { retrieve: vi.fn(async () => checkout), listLineItems: vi.fn(async () => items) } },
    paymentIntents: { retrieve: vi.fn(async () => intent) }, charges: { retrieve: vi.fn(async () => charge) },
    refunds: { list: vi.fn(async () => refunds) } }
  return { binding, stripe, account, checkout, items, intent, charge, refunds }
}
const read = (f) => readStudioStripeOrderEvidence({ stripe: f.stripe, binding: f.binding, now: NOW })
const calls = (f) => Object.values(f.stripe).flatMap((r) => r.sessions ? Object.values(r.sessions) : Object.values(r))
function veteran(f) {
  f.checkout.amount_total = f.items.data[0].amount_total = f.intent.amount = f.intent.amount_received = f.charge.amount = f.charge.amount_captured = 2900
  f.checkout.total_details.amount_discount = f.items.data[0].amount_discount = 2000
  // Actual native expired/unpaid Resume checkout readback has coupon:null with a promotion_code ID.
  f.checkout.discounts = [{ coupon: null, promotion_code: f.binding.veteranPromotionId }]
}

describe('prepared Stripe studio payment evidence (never an access grant)', () => {
  it('reads the exact native relation chain and returns minimal immutable payment evidence after class', async () => {
    const f = fixture()
    const proof = await read(f)
    expect(proof).toMatchObject({ kind: 'stripe-order-evidence-v1', accountId: f.binding.accountId,
      checkoutSessionId: f.binding.checkoutSessionId, purchaserContactId: 'original-contact', amountPaidCents: 4900,
      amountRefundedCents: 0, checkedAt: NOW.toISOString() })
    expect(Object.isFrozen(proof)).toBe(true)
    expect(JSON.stringify(proof)).not.toMatch(/must-not-export|Private name|never-export|eligible|accessVersion|seatId/)
    expect(calls(f).every((method) => method.mock.calls.length === 1)).toBe(true)
    expect(f.stripe.accounts.retrieve.mock.calls[0][0]).toBeNull()
    expect(f.stripe.checkout.sessions.listLineItems.mock.calls[0].slice(0, 2)).toEqual([f.binding.checkoutSessionId, { limit: 2 }])
    expect(f.stripe.refunds.list.mock.calls[0][0]).toEqual({ charge: f.binding.chargeId, limit: 1 })
    expect(calls(f).every((method) => method.mock.calls[0].at(-1).maxNetworkRetries === 0)).toBe(true)
  })
  it('accepts only the pinned Resume promotion and preserves the full-price product identity', async () => {
    const f = fixture('from-resume-to-revenue'); veteran(f)
    expect(await read(f)).toMatchObject({ amountPaidCents: 2900, priceId: 'price_fixture', productId: 'prod_fixture' })
  })
  it('accepts the adopted technical fee with the exact dated technical price', async () => {
    const f = fixture()
    f.binding.workshopSlug = 'github-copilot-foundations'; f.binding.sessionStart = '2027-01-22T11:00:00-06:00'
    for (const record of [f.checkout, f.intent]) { record.metadata.workshop = f.binding.workshopSlug; record.metadata.session_start = f.binding.sessionStart }
    f.checkout.amount_subtotal = f.checkout.amount_total = f.items.data[0].amount_subtotal = f.items.data[0].amount_total = 9900
    f.intent.amount = f.intent.amount_received = f.charge.amount = f.charge.amount_captured = f.items.data[0].price.unit_amount = 9900
    f.items.data[0].price.lookup_key = 'workshop_github-copilot-foundations_2027-01-22'
    expect(await read(f)).toMatchObject({ amountPaidCents: 9900, workshopSlug: 'github-copilot-foundations' })
  })
  it.each([
    ['another Stripe account', (f) => { f.account.id = 'acct_other' }],
    ['an incomplete checkout', (f) => { f.checkout.status = 'open' }],
    ['an unpaid checkout', (f) => { f.checkout.payment_status = 'unpaid' }],
    ['a free checkout', (f) => { f.checkout.payment_status = 'no_payment_required' }],
    ['a subscription', (f) => { f.checkout.mode = 'subscription' }],
    ['another mode', (f) => { f.checkout.livemode = true }],
    ['a forged session response', (f) => { f.checkout.id = 'cs_test_other' }],
    ['another customer', (f) => { f.checkout.customer = 'cus_other' }],
    ['another payment intent', (f) => { f.checkout.payment_intent = 'pi_other' }],
    ['another workshop', (f) => { f.checkout.metadata.workshop = 'ai-marketing' }],
    ['another cohort date', (f) => { f.intent.metadata.session_start = '2026-12-11T11:00:00-06:00' }],
    ['missing fulfillment contact', (f) => { delete f.intent.metadata.ghl_contact_id }],
    ['a different original buyer contact', (f) => { f.intent.metadata.ghl_contact_id = 'other-contact' }],
    ['another price', (f) => { f.items.data[0].price.id = 'price_other' }],
    ['another product', (f) => { f.items.data[0].price.product = 'prod_other' }],
    ['another dated lookup', (f) => { f.items.data[0].price.lookup_key = 'workshop_ai-video-editing_2026-11-06' }],
    ['another currency', (f) => { f.charge.currency = 'eur' }],
    ['multiple seats', (f) => { f.items.data[0].quantity = 2 }],
    ['more undisclosed items', (f) => { f.items.has_more = true }],
    ['extra line items', (f) => { f.items.data.push(structuredClone(f.items.data[0])) }],
    ['a recurring price', (f) => { f.items.data[0].price.recurring = { interval: 'month' } }],
    ['a custom price', (f) => { f.items.data[0].price.custom_unit_amount = { enabled: true } }],
    ['an unadopted tax', (f) => { f.checkout.total_details.amount_tax = 100 }],
    ['another captured amount', (f) => { f.charge.amount_captured = 4800 }],
    ['an uncaptured charge', (f) => { f.charge.captured = false }],
    ['another latest charge', (f) => { f.intent.latest_charge = 'ch_other' }],
    ['another charge/payment relation', (f) => { f.charge.payment_intent = 'pi_other' }],
    ['a partial refund', (f) => { f.charge.amount_refunded = 100 }],
    ['a full refund', (f) => { f.charge.refunded = true; f.charge.amount_refunded = 4900 }],
    ['a disputed charge', (f) => { f.charge.disputed = true }],
    ['a review', (f) => { f.charge.review = 'prv_pending' }],
    ['unread refund history', (f) => { f.refunds.has_more = true }],
    ['a pending refund', (f) => { f.refunds.data.push({ id: 're_fixture', object: 'refund', charge: 'ch_fixture', payment_intent: 'pi_fixture', amount: 4900, currency: 'usd', status: 'pending' }) }],
    ['an unreflected successful refund', (f) => { f.refunds.data.push({ id: 're_fixture', object: 'refund', charge: 'ch_fixture', payment_intent: 'pi_fixture', amount: 4900, currency: 'usd', status: 'succeeded' }) }],
    ['an already recorded refund', (f) => { f.intent.metadata.ghl_refund_recorded = 'true' }],
  ])('rejects %s', async (_, mutate) => {
    const f = fixture(); mutate(f)
    await expect(read(f)).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
  })
  it.each(['wrong-promotion', 'wrong-total', 'direct-coupon'])('rejects a noncanonical veteran discount: %s', async (which) => {
    const f = fixture('from-resume-to-revenue'); veteran(f)
    if (which === 'wrong-promotion') f.checkout.discounts[0].promotion_code = 'promo_other'
    if (which === 'wrong-total') f.checkout.amount_total = 2800
    if (which === 'direct-coupon') f.checkout.discounts[0] = { coupon: 'coupon-fixture', promotion_code: null }
    await expect(read(f)).rejects.toMatchObject({ code: 'REGISTRATION_INELIGIBLE' })
  })
  it('rejects invalid server bindings before any SDK call', async () => {
    const f = fixture(); f.binding.paymentIntentId = null
    await expect(read(f)).rejects.toMatchObject({ code: 'INVALID_BINDING' })
    expect(calls(f).every((method) => method.mock.calls.length === 0)).toBe(true)
  })
  it.each(['failed', 'canceled'])('allows a fully observed unsuccessful refund: %s', async (status) => {
    const f = fixture()
    f.refunds.data.push({ id: 're_fixture', object: 'refund', charge: 'ch_fixture', payment_intent: 'pi_fixture', amount: 4900, currency: 'usd', status })
    expect(await read(f)).toMatchObject({ amountPaidCents: 4900, amountRefundedCents: 0 })
  })
  it('does not let a mutable caller rebind the order while an account request is pending', async () => {
    const f = fixture(); let release
    f.stripe.accounts.retrieve.mockImplementation(() => new Promise((resolve) => { release = () => resolve(f.account) }))
    const pending = read(f); f.binding.checkoutSessionId = 'cs_test_other'; f.binding.purchaserContactId = 'other-contact'; release()
    const proof = await pending
    expect(proof.checkoutSessionId).toBe('cs_test_fixture')
    expect(proof.purchaserContactId).toBe('original-contact')
  })
  it('sanitizes API failures and never retries or writes', async () => {
    const f = fixture(); f.stripe.charges.retrieve.mockRejectedValue(new Error('credential/response secret'))
    const failure = await read(f).catch((error) => error)
    expect(failure.code).toBe('STRIPE_EVIDENCE_UNAVAILABLE')
    expect(String(failure)).not.toMatch(/credential|response secret/)
    expect(f.stripe.charges.retrieve).toHaveBeenCalledTimes(1)
  })
  it('leaves the actual registration verifier closed even when payment evidence is valid', async () => {
    const proof = await read(fixture())
    expect(() => checkStudioRegistrationProof(proof, { id: 'seat', cohort_id: 'cohort', access_version: 1 }, NOW)).toThrow()
    await expect(verifyStudioRegistration()).rejects.toMatchObject({ code: 'ELIGIBILITY_NOT_ACCEPTED' })
  })
  it('uses only GET endpoints with the real installed Stripe SDK against a synthetic local server', async () => {
    const f = fixture(); const requests = []
    const routes = { '/v1/account': f.account, '/v1/checkout/sessions/cs_test_fixture': f.checkout,
      '/v1/checkout/sessions/cs_test_fixture/line_items': f.items, '/v1/payment_intents/pi_fixture': f.intent,
      '/v1/charges/ch_fixture': f.charge, '/v1/refunds': f.refunds }
    const server = createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost')
      requests.push({ method: req.method, path: url.pathname, query: [...url.searchParams] })
      res.writeHead(routes[url.pathname] ? 200 : 404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(routes[url.pathname] || { error: { message: 'Unknown fixture route' } }))
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      const stripe = new Stripe('sk_test_LOCAL_FIXTURE_ONLY', { host: '127.0.0.1', port: server.address().port, protocol: 'http', maxNetworkRetries: 0 })
      expect(await readStudioStripeOrderEvidence({ stripe, binding: f.binding, now: NOW })).toMatchObject({ amountPaidCents: 4900 })
      expect(requests).toHaveLength(6)
      expect(requests.every((r) => r.method === 'GET')).toBe(true)
      expect(requests.find((r) => r.path === '/v1/refunds').query).toContainEqual(['charge', 'ch_fixture'])
    } finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) }
  })
})
