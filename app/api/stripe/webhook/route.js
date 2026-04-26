import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { upsertContact, createOpportunity } from '../../../../lib/ghl'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await handleCheckoutCompleted(session)
        break
      
      case 'invoice.paid':
        const invoice = event.data.object
        console.log(`Invoice paid: ${invoice.id}`)
        // Optional: Update opportunity status or log renewal
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object
        console.log(`Subscription deleted: ${subscription.id}`)
        // Optional: Move opportunity to "Churned" or "Lost"
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`Error processing webhook (${event.type}):`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session) {
  // 1. Extract customer and plan info
  const customerEmail = session.customer_details?.email
  const customerName = session.customer_details?.name
  const metadata = session.metadata || {}
  const planType = metadata.planType || 'monthly'
  const businessName = metadata.businessName || ''

  console.log(`Processing GHL Sync for ${customerEmail} (${planType})`)

  // 2. Sync to GHL CRM
  // This mirrors the logic in ghl_ops_sync.py and ghl_sales.py
  try {
    const [firstName, ...lastNameParts] = (customerName || '').split(' ')
    const lastName = lastNameParts.join(' ')

    // Step A: Upsert Contact
    const contactResult = await upsertContact({
      email: customerEmail,
      firstName,
      lastName,
      phone: session.customer_details?.phone || '',
      companyName: businessName,
      tags: ['growth-platform-customer', `plan-${planType}`, 'funnel-buyer']
    })

    console.log(`GHL Contact synced: ${contactResult.contactId}`)

    // Step B: Create/Update Opportunity in "Growth Platform" pipeline
    // This resolves the pipeline and moves to "Payment Received"
    const oppValue = planType === 'annual' ? 1164 : 1188 // Projected annual value

    const oppResult = await createOpportunity({
      pipelineName: 'Growth Platform',
      oppName: `${businessName || customerName} - Growth License`,
      contactId: contactResult.contactId,
      stageName: 'Payment Received',
      value: oppValue
    })

    console.log(`GHL Opportunity created: ${oppResult.opportunityId} in stage "Payment Received"`)

  } catch (ghlErr) {
    // We log the error but don't fail the webhook (Stripe already got the money)
    // You can then use your GHL skills to manually fix any sync failures
    console.error('CRITICAL: GHL Sync failed during checkout webhook:', ghlErr)
  }
}
