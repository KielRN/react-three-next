import { NextResponse } from 'next/server'
import { getStripeWorkshops } from '../../../../lib/stripe-workshops'
import {
  addContactNote,
  addContactTags,
  removeContactTags,
  searchContactsByEmail,
  updateContactCustomFields,
  upsertContact,
} from '../../../../lib/ghl'
import { fulfillPaidRegistration, recordRefund } from '../../../../lib/workshop-registration'

export const runtime = 'nodejs'

const ghl = { addContactNote, addContactTags, removeContactTags, searchContactsByEmail, updateContactCustomFields, upsertContact }

export async function POST(req) {
  const stripe = getStripeWorkshops()
  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, req.headers.get('stripe-signature'), process.env.STRIPE_WORKSHOPS_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[workshops-webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    let result = { status: 'unhandled' }
    // Card payments arrive paid on completion; Link's bank/Klarna options can settle later.
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded')
      result = await fulfillPaidRegistration(stripe, ghl, event.data.object)
    if (event.type === 'charge.refunded') result = await recordRefund(stripe, ghl, event.data.object)
    console.log(`[workshops-webhook] ${event.type} ${event.id}: ${result.status}`)
    return NextResponse.json({ received: true, ...result })
  } catch (err) {
    // Unlike the subscription funnels, return 5xx: both handlers are idempotent
    // (Stripe PaymentIntent metadata records completion), so Stripe's retries
    // over the next three days finish a GHL write that failed.
    console.error(`[workshops-webhook] ${event.type} ${event.id} failed:`, err.message)
    return NextResponse.json({ error: 'Registration fulfillment failed; Stripe will retry.' }, { status: 500 })
  }
}
