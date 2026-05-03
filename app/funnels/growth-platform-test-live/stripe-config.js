/**
 * Stripe Configuration for Growth Platform — TEST-LIVE Funnel
 *
 * Created to verify the Stripe LIVE integration with low-cost prices ($1.50/mo, $5.50/yr).
 * This funnel is NOT for real orders — see the test notice on each page.
 *
 * Defaults below are LIVE-mode IDs (real Stripe products in the live account).
 *
 * ⚠️  RAILWAY: For the deployed site, the NEXT_PUBLIC_GP_TL_* vars below must
 *     also be set in Railway → service → "Variables" tab, then trigger a
 *     redeploy (NEXT_PUBLIC_* are baked at build time). The fallbacks below
 *     will keep things working if env vars are missing, but env vars are the
 *     source of truth and should be set explicitly.
 */

export const STRIPE_CONFIG = {
  productId: process.env.NEXT_PUBLIC_GP_TL_PRODUCT_ID || 'prod_US0VMFDIx7ENKQ',

  prices: {
    monthly: process.env.NEXT_PUBLIC_GP_TL_PRICE_MONTHLY || 'price_1TT6UEJMSxLnpBGh3F1HbtFK',
    annual: process.env.NEXT_PUBLIC_GP_TL_PRICE_ANNUAL || 'price_1TT6UEJMSxLnpBGhC6Yc4LT6',
    setupFee: null,
  },

  display: {
    monthly: {
      label: 'Monthly Billing',
      price: '$1.50/mo',
      setupFee: 'None',
      firstPayment: '$1.50',
      yearTotal: '$18.00',
      priceValue: 1.5,
      setupValue: 0,
    },
    annual: {
      label: 'Annual Billing',
      price: '$5.50/yr',
      setupFee: 'None',
      firstPayment: '$5.50',
      yearTotal: '$5.50',
      priceValue: 5.5,
      setupValue: 0,
      savings: '$12.50',
    },
  },

  successUrl: '/funnels/growth-platform-test-live/thank-you',
  cancelUrl: '/funnels/growth-platform-test-live/checkout',
}
