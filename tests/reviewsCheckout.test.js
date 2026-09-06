import { beforeEach, describe, expect, it, vi } from 'vitest'

const stripe = vi.hoisted(() => ({
  customers: { list: vi.fn(), create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
}))

vi.mock('../lib/stripe-reviews', () => ({ getStripeReviews: () => stripe }))

// Supply dummy prices for the test-live route without changing its actual trial configuration.
vi.mock('../app/funnels/reviews-test-live/stripe-config', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    REVIEWS_TEST_LIVE_STRIPE_CONFIG: {
      ...actual.REVIEWS_TEST_LIVE_STRIPE_CONFIG,
      prices: Object.fromEntries(
        ['starter', 'growth', 'pro'].map((tier) => [
          tier,
          { monthly: `price_fixture_${tier}_monthly`, annual: `price_fixture_${tier}_annual` },
        ]),
      ),
    },
  }
})

import { POST as createCheckout } from '../app/api/stripe/create-checkout-session-reviews/route.js'
import { POST as createTestCheckout } from '../app/api/stripe/create-checkout-session-reviews-test-live/route.js'

const plans = ['starter', 'growth', 'pro'].flatMap((tier) =>
  ['monthly', 'annual'].map((billing) => ({ tier, billing })),
)

describe.each([
  { name: 'English', handler: createCheckout, lang: 'en' },
  { name: 'Spanish', handler: createCheckout, lang: 'es' },
  { name: 'test-live', handler: createTestCheckout, lang: 'en' },
])('$name Reviews checkout', ({ handler, lang }) => {
  beforeEach(() => {
    vi.clearAllMocks()
    stripe.customers.list.mockResolvedValue({ data: [{ id: 'cus_fixture' }] })
    stripe.checkout.sessions.create.mockResolvedValue({ client_secret: 'checkout_fixture_secret' })
  })

  it.each(plans)('starts a 14-day trial for $tier / $billing', async ({ tier, billing }) => {
    const request = new Request('https://example.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'https://example.com' },
      body: JSON.stringify({
        tier,
        billing,
        lang,
        customerInfo: { email: 'buyer@example.com', name: 'Test Buyer' },
      }),
    })

    const response = await handler(request)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ clientSecret: 'checkout_fixture_secret' })
    expect(stripe.checkout.sessions.create).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        mode: 'subscription',
        subscription_data: expect.objectContaining({ trial_period_days: 14 }),
      }),
    )
  })
})
