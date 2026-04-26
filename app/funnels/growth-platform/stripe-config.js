/**
 * Stripe Configuration for Growth Platform Funnel
 *
 * Defaults below are TEST-mode IDs (project is currently in sandbox).
 * Override with env vars in Railway for production once LIVE keys are switched on.
 *
 * LIVE price IDs (kept here for reference — set as Railway env vars when going live):
 *   Monthly:   price_1TNgYEJMSxLnpBGhsSLhZc80
 *   Annual:    price_1TNgYFJMSxLnpBGhwQ3pNrOu
 *   Setup Fee: price_1TNgYGJMSxLnpBGhFEJR5kp5
 *   Product:   prod_UMP13Mlblhjkya
 */

export const STRIPE_CONFIG = {
  // Product (TEST default)
  productId: process.env.NEXT_PUBLIC_GP_PRODUCT_ID || 'prod_UMQN23LppN8Kvg',

  // Prices — use env vars to swap test/live
  prices: {
    monthly: process.env.NEXT_PUBLIC_GP_PRICE_MONTHLY || 'price_1TNhWsJFaot9vPJChhY8TESi',
    annual: process.env.NEXT_PUBLIC_GP_PRICE_ANNUAL || 'price_1TNhWsJFaot9vPJCCXTM8PMx',
    setupFee: process.env.NEXT_PUBLIC_GP_PRICE_SETUP || 'price_1TNhWsJFaot9vPJCdreEMcxZ',
  },

  // Display pricing
  display: {
    monthly: {
      label: 'Monthly Billing',
      price: '$99/mo',
      setupFee: '$500',
      firstPayment: '$599',
      yearTotal: '$1,688',
      priceValue: 99,
      setupValue: 500,
    },
    annual: {
      label: 'Annual Billing',
      price: '$1,164/yr',
      setupFee: 'Waived',
      firstPayment: '$1,164',
      yearTotal: '$1,164',
      priceValue: 1164,
      setupValue: 0,
      savings: '$524',
    },
  },

  // Success/cancel URLs
  successUrl: '/funnels/growth-platform/thank-you',
  cancelUrl: '/funnels/growth-platform/checkout',
}
