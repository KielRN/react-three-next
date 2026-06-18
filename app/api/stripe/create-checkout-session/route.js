import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_CONFIG } from '../../../funnels/growth-platform/stripe-config'

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  try {
    const body = await req.json()
    const { planType, customerInfo } = body
    
    if (!planType || !customerInfo) {
      return NextResponse.json({ error: 'Missing planType or customerInfo' }, { status: 400 })
    }

    // Map plan to Price IDs from config (allow overrides from env vars if set)
    const priceId = planType === 'annual' 
      ? (process.env.NEXT_PUBLIC_GP_PRICE_ANNUAL || STRIPE_CONFIG.prices.annual)
      : (process.env.NEXT_PUBLIC_GP_PRICE_MONTHLY || STRIPE_CONFIG.prices.monthly)
    
    const setupFeeId = process.env.NEXT_PUBLIC_GP_PRICE_SETUP || STRIPE_CONFIG.prices.setupFee

    // Build line items
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      }
    ]

    // Only add setup fee for monthly plan
    if (planType === 'monthly') {
      lineItems.push({
        price: setupFeeId,
        quantity: 1,
      })
    }

    // 1. Find or create Stripe customer
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
          source: 'growth-platform-funnel',
        }
      })
    }

    // 2. Create Embedded Checkout Session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded_page',
      customer: customer.id,
      line_items: lineItems,
      mode: 'subscription', // Note: one-time setup fee can be added to subscription mode line items
      automatic_tax: { enabled: true },
      customer_update: { address: 'auto', name: 'auto' },
      return_url: `${req.headers.get('origin')}${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        planType,
        businessName: customerInfo.businessName,
        ghlOpportunityId: customerInfo.opportunityId || '',
        ghlContactId: customerInfo.contactId || '',
      },
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          planType,
          businessName: customerInfo.businessName,
          ghlOpportunityId: customerInfo.opportunityId || '',
          ghlContactId: customerInfo.contactId || '',
        }
      }
    })

    return NextResponse.json({ clientSecret: session.client_secret })
    
  } catch (err) {
    console.error('Stripe Session Error:', err)
    return NextResponse.json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    }, { status: 500 })
  }
}
