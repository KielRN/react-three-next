/**
 * Stripe Configuration for the Texas AI Reviews Service Funnel.
 *
 * Fallback IDs below are TEST-mode placeholders. They are intentionally
 * recognizable strings (prefix `prod_FILL_FROM_TASK_2_` / `price_FILL_FROM_TASK_2_`)
 * so the API route can detect "not configured" and return a clear 500 error
 * instead of silently calling Stripe with a bad ID.
 *
 * To populate real product/price IDs:
 *   1. Confirm STRIPE_SECRET_KEY=sk_test_... or sk_live_... is set in react-three-next/.env
 *      (Reviews reuses the same Stripe account as the Growth Platform funnel).
 *   2. Run: node .agent/skills/manage_stripe_products/scripts/create_reviews_products.js --mode=<test|live> --prefix=REV
 *   3. Either:
 *      a) Replace the fallback strings below with the real IDs the script prints, OR
 *      b) Set the NEXT_PUBLIC_REV_* env vars in react-three-next/.env (build-time inlined).
 *
 * CRITICAL: Fallbacks MUST match the currently active mode of STRIPE_SECRET_KEY.
 * Mixing test/live keys with the wrong-mode price IDs returns:
 *   "No such price: price_..."
 * — same failure mode documented in [[project_stripe_setup]].
 *
 * LIVE price IDs (set as Railway env vars at cutover; do not uncomment here):
 *   NEXT_PUBLIC_REV_PRODUCT_STARTER=<prod_…>
 *   NEXT_PUBLIC_REV_PRODUCT_GROWTH=<prod_…>
 *   NEXT_PUBLIC_REV_PRODUCT_PRO=<prod_…>
 *   NEXT_PUBLIC_REV_PRICE_STARTER_MONTHLY=<price_…>
 *   NEXT_PUBLIC_REV_PRICE_STARTER_ANNUAL=<price_…>
 *   NEXT_PUBLIC_REV_PRICE_GROWTH_MONTHLY=<price_…>
 *   NEXT_PUBLIC_REV_PRICE_GROWTH_ANNUAL=<price_…>
 *   NEXT_PUBLIC_REV_PRICE_PRO_MONTHLY=<price_…>
 *   NEXT_PUBLIC_REV_PRICE_PRO_ANNUAL=<price_…>
 */

export const REVIEWS_STRIPE_CONFIG = {
  products: {
    starter: process.env.NEXT_PUBLIC_REV_PRODUCT_STARTER || 'prod_UdrcxSmD0OJbBO',
    growth: process.env.NEXT_PUBLIC_REV_PRODUCT_GROWTH || 'prod_UdrcC4kQwT981T',
    pro: process.env.NEXT_PUBLIC_REV_PRODUCT_PRO || 'prod_Udrc2OFNvQcmYA',
  },
  prices: {
    starter: {
      monthly: process.env.NEXT_PUBLIC_REV_PRICE_STARTER_MONTHLY || 'price_1TeZtaJMSxLnpBGh40GjQsCC',
      annual: process.env.NEXT_PUBLIC_REV_PRICE_STARTER_ANNUAL || 'price_1TeZtbJMSxLnpBGhM5cNJ00u',
    },
    growth: {
      monthly: process.env.NEXT_PUBLIC_REV_PRICE_GROWTH_MONTHLY || 'price_1TeZtbJMSxLnpBGhlGiSMS0d',
      annual: process.env.NEXT_PUBLIC_REV_PRICE_GROWTH_ANNUAL || 'price_1TeZtbJMSxLnpBGhVucOHFcP',
    },
    pro: {
      monthly: process.env.NEXT_PUBLIC_REV_PRICE_PRO_MONTHLY || 'price_1TeZtbJMSxLnpBGh6XKh5ukr',
      annual: process.env.NEXT_PUBLIC_REV_PRICE_PRO_ANNUAL || 'price_1TeZtcJMSxLnpBGhHl8IMQH1',
    },
  },

  display: {
    starter: {
      key: 'starter',
      name: 'Starter',
      volume: 'Up to 50 requests per month',
      priceMonthly: '$99',
      priceAnnual: '$990',
      priceMonthlyValue: 99,
      priceAnnualValue: 990,
      popular: false,
    },
    growth: {
      key: 'growth',
      name: 'Growth',
      volume: '50–100 requests per month',
      priceMonthly: '$179',
      priceAnnual: '$1,790',
      priceMonthlyValue: 179,
      priceAnnualValue: 1790,
      popular: true,
    },
    pro: {
      key: 'pro',
      name: 'Pro',
      volume: '100–300 requests per month',
      priceMonthly: '$279',
      priceAnnual: '$2,790',
      priceMonthlyValue: 279,
      priceAnnualValue: 2790,
      popular: false,
    },
  },

  features: [
    'Get 4x More Reviews',
    'Automated Text & Emails',
    'Review Reactivation',
    'Dynamic Review Follow-ups',
    'AI Smart Messaging',
    'Personalized Image Requests',
    'Auto AI Review Replies',
    'Social Media Review Posting',
    'Custom CRM Integration',
    'Access to Zapier',
    'Unlimited Users',
    '1-1 Setup Call',
  ],

  trial: {
    days: 10,
    ctaLabel: 'Start 10-Day Free Trial',
  },

  successUrl: '/funnels/reviews/thank-you',
  cancelUrl: '/funnels/reviews/pricing',
}
