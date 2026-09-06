/**
 * Stripe Configuration for the Reviews TEST-LIVE Mirror Funnel.
 *
 * Used ONLY to verify the LIVE Stripe integration for the Reviews funnel
 * with low-cost dummy prices ($1.50/mo, $5.50/yr). No real orders flow
 * through this funnel — pages display a red "TEST PAGE" banner and are
 * noindex,nofollow.
 *
 * Fallbacks below are placeholders until the LIVE-mode dummy products
 * are created (Task 33). To populate, run:
 *   node .agent/skills/manage_stripe_products/scripts/create_reviews_products.js \
 *     --mode=live --prefix=REV_TL \
 *     --starter-monthly=150 --starter-annual=550 \
 *     --growth-monthly=150  --growth-annual=550 \
 *     --pro-monthly=150     --pro-annual=550
 *
 * Until then, the checkout flow on /funnels/reviews-test-live will fail
 * with "No such price" or "Test-live price ID not configured" — that's
 * expected and harmless.
 */

export const REVIEWS_TEST_LIVE_STRIPE_CONFIG = {
  products: {
    starter: process.env.NEXT_PUBLIC_REV_TL_PRODUCT_STARTER || 'prod_REV_TL_STARTER_FILL_AT_CUTOVER',
    growth: process.env.NEXT_PUBLIC_REV_TL_PRODUCT_GROWTH || 'prod_REV_TL_GROWTH_FILL_AT_CUTOVER',
    pro: process.env.NEXT_PUBLIC_REV_TL_PRODUCT_PRO || 'prod_REV_TL_PRO_FILL_AT_CUTOVER',
  },
  prices: {
    starter: {
      monthly: process.env.NEXT_PUBLIC_REV_TL_PRICE_STARTER_MONTHLY || 'price_REV_TL_STARTER_MONTHLY_FILL_AT_CUTOVER',
      annual: process.env.NEXT_PUBLIC_REV_TL_PRICE_STARTER_ANNUAL || 'price_REV_TL_STARTER_ANNUAL_FILL_AT_CUTOVER',
    },
    growth: {
      monthly: process.env.NEXT_PUBLIC_REV_TL_PRICE_GROWTH_MONTHLY || 'price_REV_TL_GROWTH_MONTHLY_FILL_AT_CUTOVER',
      annual: process.env.NEXT_PUBLIC_REV_TL_PRICE_GROWTH_ANNUAL || 'price_REV_TL_GROWTH_ANNUAL_FILL_AT_CUTOVER',
    },
    pro: {
      monthly: process.env.NEXT_PUBLIC_REV_TL_PRICE_PRO_MONTHLY || 'price_REV_TL_PRO_MONTHLY_FILL_AT_CUTOVER',
      annual: process.env.NEXT_PUBLIC_REV_TL_PRICE_PRO_ANNUAL || 'price_REV_TL_PRO_ANNUAL_FILL_AT_CUTOVER',
    },
  },

  display: {
    starter: {
      key: 'starter',
      name: 'Starter (TEST-LIVE)',
      volume: 'TEST: 50 req/mo',
      priceMonthly: '$1.50',
      priceAnnual: '$5.50',
      popular: false,
    },
    growth: {
      key: 'growth',
      name: 'Growth (TEST-LIVE)',
      volume: 'TEST: 50–100 req/mo',
      priceMonthly: '$1.50',
      priceAnnual: '$5.50',
      popular: true,
    },
    pro: {
      key: 'pro',
      name: 'Pro (TEST-LIVE)',
      volume: 'TEST: 100–300 req/mo',
      priceMonthly: '$1.50',
      priceAnnual: '$5.50',
      popular: false,
    },
  },

  features: [
    'TEST PURCHASE — no real service delivered',
    'Verifies LIVE Stripe wiring end-to-end',
    'Refund immediately after smoke test',
  ],

  trial: { days: 14, ctaLabel: 'Start TEST-LIVE Trial' },

  successUrl: '/funnels/reviews-test-live/thank-you',
  cancelUrl: '/funnels/reviews-test-live/pricing',
}
