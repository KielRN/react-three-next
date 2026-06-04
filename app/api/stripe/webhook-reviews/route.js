import { NextResponse } from 'next/server'
import { getStripeReviews } from '../../../../lib/stripe-reviews'
import { upsertContact, createOpportunity, moveOpportunityToStage } from '../../../../lib/ghl'

const PIPELINE_NAME = 'Reviews Service'

export async function POST(req) {
  const stripe = getStripeReviews()
  const endpointSecret = process.env.STRIPE_REVIEWS_WEBHOOK_SECRET
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('[reviews-webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Short-circuit test-live events: log and return 200 without GHL writes.
  const source =
    event.data?.object?.metadata?.source || event.data?.object?.subscription_details?.metadata?.source || ''
  if (source === 'reviews_funnel_test_live') {
    console.log(`[reviews-webhook] test-live event ${event.type} — skipping GHL fulfillment`)
    return NextResponse.json({ received: true, skipped: 'test_live' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      default:
        console.log(`[reviews-webhook] unhandled event type: ${event.type}`)
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    // Log but return 200 — Stripe retries indefinitely on 5xx and we already accepted payment.
    console.error(`[reviews-webhook] error processing ${event.type}:`, err)
    return NextResponse.json({ received: true, error: err.message })
  }
}

async function handleCheckoutCompleted(session) {
  const email = session.customer_details?.email
  const fullName = session.customer_details?.name || ''
  const phone = session.customer_details?.phone || ''
  const meta = session.metadata || {}
  const tier = meta.tier || 'unknown'
  const billing = meta.billing || 'monthly'
  const company = meta.company || ''

  if (!email) {
    console.warn('[reviews-webhook] checkout.session.completed without email — skipping GHL sync')
    return
  }

  const [firstName, ...lastNameParts] = fullName.split(' ')
  const lastName = lastNameParts.join(' ')

  const tags = ['reviews-service', `${tier}-tier`, `billing-${billing}`, 'trial-active']

  const contactResult = await upsertContact({
    email,
    firstName,
    lastName,
    phone,
    companyName: company,
    tags,
  })
  console.log(`[reviews-webhook] GHL contact upserted: ${contactResult.contactId}`)

  const oppValue = computeOppValue(tier, billing)
  const oppName = `${company || fullName || email} — ${tier}`

  const oppResult = await createOpportunity({
    pipelineName: PIPELINE_NAME,
    oppName,
    contactId: contactResult.contactId,
    stageName: 'Trial Started',
    value: oppValue,
  })
  console.log(`[reviews-webhook] GHL opportunity created: ${oppResult.opportunityId} (Trial Started)`)

  // Persist the GHL oppId on the Stripe subscription so future webhook events
  // for this subscription (trial_will_end, invoice.paid, deleted) can find
  // the opportunity and move it through the pipeline.
  if (session.subscription && oppResult?.opportunityId) {
    try {
      const stripe = getStripeReviews()
      await stripe.subscriptions.update(session.subscription, {
        metadata: { ghlOpportunityId: oppResult.opportunityId },
      })
      console.log(`[reviews-webhook] stored ghlOpportunityId on subscription ${session.subscription}`)
    } catch (err) {
      console.warn(`[reviews-webhook] could not write ghlOpportunityId to ${session.subscription}:`, err.message)
    }
  }
}

async function handleTrialWillEnd(subscription) {
  const email = subscription.customer_email || (await lookupEmailFromCustomer(subscription.customer))
  if (!email) {
    console.warn('[reviews-webhook] trial_will_end — cannot resolve email')
    return
  }
  await upsertContact({ email, tags: ['reviews-service', 'trial-ending-soon'] })
  console.log(`[reviews-webhook] tagged ${email} as trial-ending-soon`)
  await moveOpp(subscription, 'Trial Ending Soon')
}

async function handleInvoicePaid(invoice) {
  if (invoice.billing_reason !== 'subscription_cycle') return
  if (!invoice.amount_paid || invoice.amount_paid <= 0) return

  const email = invoice.customer_email
  if (!email) {
    console.warn('[reviews-webhook] invoice.paid — no email on invoice')
    return
  }
  await upsertContact({ email, tags: ['reviews-service', 'active-subscriber'] })
  console.log(`[reviews-webhook] tagged ${email} as active-subscriber (trial converted)`)

  // Invoices don't carry subscription.metadata directly — fetch the sub.
  if (invoice.subscription) {
    const stripe = getStripeReviews()
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
      await moveOpp(subscription, 'Active Subscription')
    } catch (err) {
      console.warn(`[reviews-webhook] could not retrieve sub ${invoice.subscription} for stage move:`, err.message)
    }
  }
}

async function handleSubscriptionDeleted(subscription) {
  const email = subscription.customer_email || (await lookupEmailFromCustomer(subscription.customer))
  if (!email) return

  const wasInTrial =
    subscription.status === 'canceled' && subscription.trial_end && Date.now() / 1000 < subscription.trial_end
  const tag = wasInTrial ? 'trial-ended-no-conversion' : 'churned'
  const stage = wasInTrial ? 'Trial Ended No Conversion' : 'Churned'

  await upsertContact({ email, tags: ['reviews-service', tag] })
  console.log(`[reviews-webhook] tagged ${email} as ${tag}`)
  await moveOpp(subscription, stage)
}

async function handlePaymentFailed(invoice) {
  const email = invoice.customer_email
  if (!email) return
  await upsertContact({ email, tags: ['reviews-service', 'payment-failed'] })
  console.log(`[reviews-webhook] tagged ${email} as payment-failed`)
  // No stage move — Stripe retries automatically and the eventual deleted event
  // will route through Churned if all retries fail.
}

/**
 * Move the opportunity associated with a Stripe subscription to a named stage.
 * Reads ghlOpportunityId from the subscription's metadata (set on
 * checkout.session.completed). Tolerant of missing oppId (logs and continues).
 */
async function moveOpp(subscription, stageName) {
  const oppId = subscription?.metadata?.ghlOpportunityId
  if (!oppId) {
    console.warn(
      `[reviews-webhook] no ghlOpportunityId on subscription ${subscription?.id} — skipping move to "${stageName}"`,
    )
    return
  }
  try {
    await moveOpportunityToStage({ oppId, pipelineName: PIPELINE_NAME, stageName })
    console.log(`[reviews-webhook] moved opp ${oppId} → ${stageName}`)
  } catch (err) {
    console.warn(`[reviews-webhook] could not move opp ${oppId} → "${stageName}":`, err.message)
  }
}

function computeOppValue(tier, billing) {
  const valueMap = {
    starter: { monthly: 99, annual: 990 },
    growth: { monthly: 179, annual: 1790 },
    pro: { monthly: 279, annual: 2790 },
  }
  return valueMap[tier]?.[billing] ?? 0
}

async function lookupEmailFromCustomer(customerId) {
  if (!customerId) return null
  const stripe = getStripeReviews()
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return customer?.email || null
  } catch (err) {
    console.warn(`[reviews-webhook] failed to retrieve customer ${customerId}:`, err.message)
    return null
  }
}
