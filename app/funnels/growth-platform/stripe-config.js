/**
 * Stripe Configuration for Growth Platform Funnel
 * 
 * LIVE price IDs (created via Stripe MCP):
 *   Monthly:   price_1TNgYEJMSxLnpBGhsSLhZc80
 *   Annual:    price_1TNgYFJMSxLnpBGhwQ3pNrOu
 *   Setup Fee: price_1TNgYGJMSxLnpBGhFEJR5kp5
 * 
 * For TEST MODE: Create matching products/prices in Stripe Dashboard
 * (toggle to "Test mode") and update the IDs below.
 */

export const STRIPE_CONFIG = {
  // Product
  productId: process.env.NEXT_PUBLIC_GP_PRODUCT_ID || 'prod_UMP13Mlblhjkya',

  // Prices — use env vars so test/live can be swapped easily
  prices: {
    monthly: process.env.NEXT_PUBLIC_GP_PRICE_MONTHLY || 'price_1TNgYEJMSxLnpBGhsSLhZc80',
    annual: process.env.NEXT_PUBLIC_GP_PRICE_ANNUAL || 'price_1TNgYFJMSxLnpBGhwQ3pNrOu',
    setupFee: process.env.NEXT_PUBLIC_GP_PRICE_SETUP || 'price_1TNgYGJMSxLnpBGhFEJR5kp5',
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
