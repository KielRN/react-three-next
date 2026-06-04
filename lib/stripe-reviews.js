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
    stripeReviews = new Stripe(key, { apiVersion: '2024-06-20' })
  }
  return stripeReviews
}
