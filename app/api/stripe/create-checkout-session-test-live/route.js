import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG } from '../../../funnels/growth-platform-test-live/stripe-config'

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  try {
    const body = await req.json()
    const { planType, customerInfo } = body

    if (!planType || !customerInfo) {
      return NextResponse.json({ error: 'Missing planType or customerInfo' }, { status: 400 })
    }

    const priceId = planType === 'annual'
      ? (process.env.NEXT_PUBLIC_GP_TL_PRICE_ANNUAL || STRIPE_CONFIG.prices.annual)
      : (process.env.NEXT_PUBLIC_GP_TL_PRICE_MONTHLY || STRIPE_CONFIG.prices.monthly)

    const lineItems = [{ price: priceId, quantity: 1 }]

    let customers = await stripe.customers.list({
      email: customerInfo.email,
      limit: 1,
    })

    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerInfo.email,
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        metadata: {
          businessName: customerInfo.businessName,
          industry: customerInfo.industry,
          source: 'growth-platform-test-live-funnel',
        },
      })
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      customer: customer.id,
      line_items: lineItems,
      mode: 'subscription',
      automatic_tax: { enabled: true },
      customer_update: { address: 'auto', name: 'auto' },
      return_url: `${req.headers.get('origin')}${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        planType,
        businessName: customerInfo.businessName,
        funnel: 'growth-platform-test-live',
      },
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          planType,
          businessName: customerInfo.businessName,
          funnel: 'growth-platform-test-live',
        },
      },
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error('Stripe Session Error (test-live):', err)
    return NextResponse.json(
      {
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      { status: 500 }
    )
  }
}
