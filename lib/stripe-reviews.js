import Stripe from 'stripe'

/**
 * Stripe SDK singleton for the Reviews funnel.
 *
 * Reuses the shared STRIPE_SECRET_KEY — the Reviews funnel runs in the same
 * Stripe account as the Growth Platform funnel. The two funnels are kept
 * separate via distinct product/price IDs (NEXT_PUBLIC_REV_*) and a distinct
 * webhook endpoint (/api/stripe/webhook-reviews with STRIPE_REVIEWS_WEBHOOK_SECRET).
 *
 * Shared by /api/stripe/create-checkout-session-reviews and
 * /api/stripe/create-checkout-session-reviews-test-live.
 */
let stripeReviews = null

export function getStripeReviews() {
  if (!stripeReviews) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set. The Reviews funnel cannot run without it.')
    }
    // No apiVersion pin — uses the account's default API version (currently in the
    // dahlia release family). ui_mode: 'embedded_page' (used by both checkout routes)
    // requires 2026-03-25.dahlia or newer; pinning an older version returns
    // "Invalid ui_mode: embedded_page". This matches the GP route's approach.
    stripeReviews = new Stripe(key)
  }
  return stripeReviews
}
