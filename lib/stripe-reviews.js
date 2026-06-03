import Stripe from 'stripe'

/**
 * Stripe SDK singleton for the Reviews funnel.
 *
 * Uses REV_STRIPE_SECRET_KEY (account acct_1SjkDhJ1tlU9uDio). DO NOT use
 * STRIPE_SECRET_KEY here — that belongs to the Growth Platform account.
 *
 * Shared by /api/stripe/create-checkout-session-reviews and
 * /api/stripe/create-checkout-session-reviews-test-live. The same Stripe
 * account is used in both modes; test-live just uses different product/price IDs.
 */
let stripeReviews = null

export function getStripeReviews() {
  if (!stripeReviews) {
    const key = process.env.REV_STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('REV_STRIPE_SECRET_KEY is not set. The Reviews funnel cannot run without it.')
    }
    stripeReviews = new Stripe(key, { apiVersion: '2024-06-20' })
  }
  return stripeReviews
}
