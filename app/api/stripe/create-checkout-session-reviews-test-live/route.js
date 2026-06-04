import { NextResponse } from 'next/server'
import { getStripeReviews } from '../../../../lib/stripe-reviews'
import { REVIEWS_TEST_LIVE_STRIPE_CONFIG } from '../../../funnels/reviews-test-live/stripe-config'

const VALID_TIERS = ['starter', 'growth', 'pro']
const VALID_BILLING = ['monthly', 'annual']

export async function POST(req) {
  try {
    const stripe = getStripeReviews()
    const body = await req.json()
    const { tier, billing, customerInfo } = body

    if (!VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}` },
        { status: 400 },
      )
    }
    if (!VALID_BILLING.includes(billing)) {
      return NextResponse.json(
        { error: `Invalid billing. Must be one of: ${VALID_BILLING.join(', ')}` },
        { status: 400 },
      )
    }
    if (!customerInfo?.email) {
      return NextResponse.json({ error: 'customerInfo.email is required' }, { status: 400 })
    }

    const priceId = REVIEWS_TEST_LIVE_STRIPE_CONFIG.prices[tier][billing]
    if (!priceId || priceId.includes('FILL_AT_CUTOVER')) {
      return NextResponse.json(
        {
          error: `Test-live price ID not configured for ${tier}/${billing}. Run create_reviews_products.js with --prefix=REV_TL.`,
        },
        { status: 500 },
      )
    }

    let customers = await stripe.customers.list({ email: customerInfo.email, limit: 1 })
    let customer = customers.data[0]
    if (!customer) {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: customerInfo.name,
        metadata: { source: 'reviews_funnel_test_live' },
      })
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      return_url: `${req.headers.get('origin')}${REVIEWS_TEST_LIVE_STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      payment_method_types: ['card'],
      metadata: {
        tier,
        billing,
        source: 'reviews_funnel_test_live',
      },
      subscription_data: {
        trial_period_days: 10,
        metadata: {
          tier,
          billing,
          source: 'reviews_funnel_test_live',
        },
      },
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error('Reviews TEST-LIVE checkout session error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
