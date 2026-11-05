'use client'

import { useEffect, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import styles from '../../../app/workshops/workshops.module.css'
import { OPT_IN_TEXT } from '../../../lib/newsletter'

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

// Step 1: name, email and policy. Step 2: Stripe Embedded Checkout on this page.
// Uses createEmbeddedCheckoutPage directly (see .agent/skills/stripe-checkout-funnel).
export default function WorkshopCheckout({ slug, title, policy }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const container = useRef(null)

  useEffect(() => {
    if (!clientSecret || !container.current) return
    let destroyed = false
    let checkout
    ;(async () => {
      try {
        if (!stripePromise) throw new Error('Payment is not configured. Please email elliott@texasaiconsulting.com.')
        const stripe = await stripePromise
        checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret })
        if (destroyed) return checkout.destroy()
        checkout.mount(container.current)
      } catch (failure) {
        if (!destroyed) {
          setError(failure.message || 'The payment form could not load.')
          setStatus('error')
        }
      }
    })()
    return () => {
      destroyed = true
      checkout?.destroy()
    }
  }, [clientSecret])

  async function submit(event) {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/workshop-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: form.get('name'),
          email: form.get('email'),
          policy: form.get('policy') === 'on',
          newsletter: form.get('newsletter') === 'on',
        }),
        signal: AbortSignal.timeout(45000),
      })
      const result = await response.json()
      if (result.status === 'sold_out') return setStatus('sold_out')
      if (!response.ok || !result.clientSecret) throw new Error(result.error || 'Checkout could not start.')
      setClientSecret(result.clientSecret)
      setStatus('paying')
    } catch (failure) {
      setError(failure.name === 'TimeoutError' ? 'Checkout took too long to start. Please retry.' : failure.message)
      setStatus('error')
    }
  }

  if (status === 'sold_out')
    return (
      <div className={styles.success} role='status'>
        <h3>This session is full</h3>
        <p>
          All seats for {title} are taken. Use the inquiry form on the workshop page to hear about the next date or a
          private group.
        </p>
      </div>
    )
  if (status === 'paying') return <div ref={container} aria-label='Secure payment form' />
  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor={`reg-name-${slug}`}>
        Name
        <input id={`reg-name-${slug}`} name='name' autoComplete='name' required maxLength={100} />
      </label>
      <label htmlFor={`reg-email-${slug}`}>
        Email
        <input id={`reg-email-${slug}`} name='email' type='email' autoComplete='email' required maxLength={254} />
      </label>
      <p>{policy}</p>
      <label className={styles.consent} htmlFor={`reg-policy-${slug}`}>
        <input id={`reg-policy-${slug}`} name='policy' type='checkbox' required />I have read the cancellation policy.
      </label>
      <label className={styles.consent} htmlFor={`reg-newsletter-${slug}`}>
        <input id={`reg-newsletter-${slug}`} name='newsletter' type='checkbox' />
        {OPT_IN_TEXT}
      </label>
      {error ? (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      ) : null}
      <button type='submit' className={styles.button} disabled={status === 'sending'}>
        {status === 'sending' ? 'Starting checkout…' : 'Continue to payment'}
      </button>
    </form>
  )
}
