import { NextResponse } from 'next/server'
import { getStripeReviews } from '../../../../lib/stripe-reviews'
import { REVIEWS_STRIPE_CONFIG } from '../../../funnels/reviews/stripe-config'

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
    if (!customerInfo || !customerInfo.email) {
      return NextResponse.json({ error: 'customerInfo.email is required' }, { status: 400 })
    }

    const priceId = REVIEWS_STRIPE_CONFIG.prices[tier][billing]
    if (!priceId || priceId.startsWith('price_FILL_FROM_TASK_2')) {
      return NextResponse.json(
        {
          error: `Price ID not configured for ${tier}/${billing}. Run create_reviews_products.js and set NEXT_PUBLIC_REV_PRICE_* env vars.`,
        },
        { status: 500 },
      )
    }

    let customers = await stripe.customers.list({ email: customerInfo.email, limit: 1 })
    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: customerInfo.name,
        phone: customerInfo.phone,
        metadata: {
          company: customerInfo.company || '',
          source: 'reviews_funnel',
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      return_url: `${req.headers.get('origin')}${REVIEWS_STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      payment_method_types: ['card'],
      metadata: {
        tier,
        billing,
        source: 'reviews_funnel',
        company: customerInfo.company || '',
      },
      subscription_data: {
        metadata: {
          tier,
          billing,
          source: 'reviews_funnel',
          company: customerInfo.company || '',
        },
      },
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error('Reviews checkout session error:', err)
    return NextResponse.json(
      {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      { status: 500 },
    )
  }
}
