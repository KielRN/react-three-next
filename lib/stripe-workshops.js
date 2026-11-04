import Stripe from 'stripe'

/**
 * Stripe SDK singleton for paid workshop registration.
 *
 * Uses the shared STRIPE_SECRET_KEY, like the Growth Platform and Reviews funnels.
 * Workshop prices are found by lookup_key (lib/workshops.js workshopLookupKey), so
 * the same code runs in test or live mode with no price IDs to swap. Events arrive
 * on /api/stripe/webhook-workshops, signed with STRIPE_WORKSHOPS_WEBHOOK_SECRET.
 */
let stripeWorkshops = null

export function getStripeWorkshops() {
  if (!stripeWorkshops) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set. Workshop registration cannot run without it.')
    // No apiVersion pin: ui_mode 'embedded_page' needs the account's 2026-03-25+ default.
    stripeWorkshops = new Stripe(key)
  }
  return stripeWorkshops
}
