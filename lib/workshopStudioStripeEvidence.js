// Server-only payment evidence preparation. No credentials, routes, issuer,
// persistence or access grant. The actual registration verifier remains closed.
import { getWorkshop, workshopLookupKey, workshopSessions } from './workshops.js'
import { fail, requireTime } from './workshopStudioPolicy.js'

const options = Object.freeze({ maxNetworkRetries: 0, timeout: 5000 })
const reject = () => fail('REGISTRATION_INELIGIBLE', 'Workshop payment evidence could not be verified.')
const invalid = () => fail('INVALID_BINDING', 'A trusted server order binding is required.')
const identity = (value) => typeof value === 'string' ? value : value?.deleted === true ? undefined : value?.id
const integer = (value) => Number.isSafeInteger(value) && value >= 0
const dateValue = (value) => typeof value === 'string' && value.length <= 50 && value.includes('T') ? Date.parse(value) : NaN
function reference(value, prefix) {
  if (typeof value !== 'string' || !new RegExp(`^${prefix}[A-Za-z0-9_-]{1,120}$`).test(value)) invalid()
  return value
}
function bindingSnapshot(input) {
  if (!input || typeof input !== 'object' || typeof input.livemode !== 'boolean') invalid()
  const workshop = getWorkshop(input.workshopSlug)
  const start = dateValue(input.sessionStart)
  // Paid access can continue after class. Never use getWorkshopSession's future-only filter here.
  const session = workshopSessions.find((candidate) => candidate.slug === input.workshopSlug && Date.parse(candidate.start) === start)
  if (!workshop || !session) invalid()
  const b = {
    accountId: reference(input.accountId, 'acct_'), livemode: input.livemode,
    checkoutSessionId: reference(input.checkoutSessionId, input.livemode ? 'cs_live_' : 'cs_test_'),
    paymentIntentId: reference(input.paymentIntentId, 'pi_'), chargeId: reference(input.chargeId, 'ch_'),
    customerId: reference(input.customerId, 'cus_'), purchaserContactId: reference(input.purchaserContactId, ''),
    priceId: reference(input.priceId, 'price_'), productId: reference(input.productId, 'prod_'),
    workshopSlug: workshop.slug, sessionStart: session.start, start, lookupKey: workshopLookupKey(session),
    baseCents: workshop.priceUSD * 100, veteranCents: workshop.veteranPriceUSD ? workshop.veteranPriceUSD * 100 : null,
    veteranPromotionId: input.veteranPromotionId == null ? null : reference(input.veteranPromotionId, 'promo_'),
    veteranCouponId: input.veteranCouponId == null ? null : reference(input.veteranCouponId, ''),
  }
  if ((b.veteranPromotionId || b.veteranCouponId) && (!b.veteranCents || !b.veteranPromotionId || !b.veteranCouponId)) invalid()
  return Object.freeze(b)
}
function metadataMatches(record, b) {
  return record?.metadata?.source === 'workshop_registration' && record.metadata.workshop === b.workshopSlug &&
    dateValue(record.metadata.session_start) === b.start
}
function nativeObject(record, type, id, b) {
  if (record?.object !== type || record.id !== id || record.livemode !== b.livemode) reject()
}
async function read(callback) {
  try { return await callback({ ...options }) }
  catch { fail('STRIPE_EVIDENCE_UNAVAILABLE', 'Workshop payment verification is temporarily unavailable.') }
}

export async function readStudioStripeOrderEvidence({ stripe, binding, now } = {}) {
  // Copy only validated primitives BEFORE any await. Nothing below trusts mutable caller objects.
  const b = bindingSnapshot(binding)
  const checkedAt = requireTime(now).toISOString()
  const account = await read((opts) => stripe.accounts.retrieve(null, {}, opts))
  if (account?.object !== 'account' || account.id !== b.accountId) reject()

  const checkout = await read((opts) => stripe.checkout.sessions.retrieve(b.checkoutSessionId, {}, opts))
  nativeObject(checkout, 'checkout.session', b.checkoutSessionId, b)
  if (checkout.status !== 'complete' || checkout.mode !== 'payment' || checkout.payment_status !== 'paid' ||
      identity(checkout.customer) !== b.customerId || identity(checkout.payment_intent) !== b.paymentIntentId ||
      !metadataMatches(checkout, b) || checkout.currency !== 'usd' || checkout.amount_subtotal !== b.baseCents ||
      !integer(checkout.amount_total) || checkout.total_details?.amount_shipping !== 0 || checkout.total_details.amount_tax !== 0) reject()
  const paid = checkout.amount_total
  const discount = checkout.total_details.amount_discount
  if (!integer(discount) || paid + discount !== b.baseCents) reject()
  if (discount === 0) {
    if (paid !== b.baseCents || (checkout.discounts != null && (!Array.isArray(checkout.discounts) || checkout.discounts.length))) reject()
  } else {
    if (!b.veteranCents || paid !== b.veteranCents || !b.veteranPromotionId || !Array.isArray(checkout.discounts) || checkout.discounts.length !== 1) reject()
    const applied = checkout.discounts[0]
    if (identity(applied?.promotion_code) !== b.veteranPromotionId ||
        (applied.coupon != null && identity(applied.coupon) !== b.veteranCouponId)) reject()
  }

  const items = await read((opts) => stripe.checkout.sessions.listLineItems(b.checkoutSessionId, { limit: 2 }, opts))
  if (items?.object !== 'list' || items.has_more !== false || !Array.isArray(items.data) || items.data.length !== 1) reject()
  const item = items.data[0]
  const price = item?.price
  nativeObject(price, 'price', b.priceId, b)
  if (item.object !== 'item' || item.quantity !== 1 || item.currency !== 'usd' || item.amount_subtotal !== b.baseCents ||
      item.amount_total !== paid || item.amount_discount !== discount || item.amount_tax !== 0 ||
      identity(price.product) !== b.productId || price.lookup_key !== b.lookupKey || price.currency !== 'usd' ||
      price.unit_amount !== b.baseCents || price.type !== 'one_time' || price.billing_scheme !== 'per_unit' ||
      price.recurring != null || price.transform_quantity != null || price.custom_unit_amount != null) reject()

  const intent = await read((opts) => stripe.paymentIntents.retrieve(b.paymentIntentId, {}, opts))
  nativeObject(intent, 'payment_intent', b.paymentIntentId, b)
  if (intent.status !== 'succeeded' || intent.currency !== 'usd' || intent.amount !== paid || intent.amount_received !== paid ||
      identity(intent.customer) !== b.customerId || identity(intent.latest_charge) !== b.chargeId || !metadataMatches(intent, b) ||
      intent.metadata.ghl_contact_id !== b.purchaserContactId || intent.metadata.ghl_refund_recorded === 'true') reject()

  const refunds = await read((opts) => stripe.refunds.list({ charge: b.chargeId, limit: 1 }, opts))
  if (refunds?.object !== 'list' || refunds.has_more !== false || !Array.isArray(refunds.data) || refunds.data.length > 1) reject()
  for (const refund of refunds.data) {
    if (refund?.object !== 'refund' || identity(refund.charge) !== b.chargeId || identity(refund.payment_intent) !== b.paymentIntentId ||
        refund.currency !== 'usd' || !integer(refund.amount) || refund.amount < 1 || refund.amount > paid ||
        !['failed', 'canceled'].includes(refund.status)) reject()
  }
  // Read the charge LAST: partial/full refund and dispute state may have changed during earlier reads.
  // This is still a timestamped observation, not a lock on Stripe or authorization to spend.
  const charge = await read((opts) => stripe.charges.retrieve(b.chargeId, {}, opts))
  nativeObject(charge, 'charge', b.chargeId, b)
  if (charge.status !== 'succeeded' || charge.paid !== true || charge.captured !== true || charge.refunded !== false ||
      charge.amount_refunded !== 0 || charge.disputed !== false || charge.review != null || charge.currency !== 'usd' ||
      charge.amount !== paid || charge.amount_captured !== paid || identity(charge.payment_intent) !== b.paymentIntentId ||
      identity(charge.customer) !== b.customerId) reject()

  return Object.freeze({ kind: 'stripe-order-evidence-v1', accountId: b.accountId, livemode: b.livemode,
    checkoutSessionId: b.checkoutSessionId, paymentIntentId: b.paymentIntentId, chargeId: b.chargeId,
    customerId: b.customerId, purchaserContactId: b.purchaserContactId, workshopSlug: b.workshopSlug,
    sessionStart: b.sessionStart, priceId: b.priceId, productId: b.productId, amountPaidCents: paid,
    amountRefundedCents: 0, checkedAt })
}
