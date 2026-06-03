'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import ReviewsFunnelHeader from '../../reviews/components/ReviewsFunnelHeader'
import { REVIEWS_TEST_LIVE_STRIPE_CONFIG } from '../stripe-config'

const STRIPE_PK = process.env.NEXT_PUBLIC_REV_STRIPE_PUBLISHABLE_KEY
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

function CheckoutInner() {
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier') || 'growth'
  const billing = searchParams.get('billing') || 'monthly'
  const tierDisplay = REVIEWS_TEST_LIVE_STRIPE_CONFIG.display[tier]
  const priceLabel = billing === 'monthly' ? tierDisplay?.priceMonthly : tierDisplay?.priceAnnual

  const [step, setStep] = useState(1)
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', company: '', phone: '' })
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')
  const [checkoutReady, setCheckoutReady] = useState(false)
  const checkoutContainerRef = useRef(null)
  const checkoutInstanceRef = useRef(null)

  const fetchClientSecret = useCallback(async () => {
    setError('')
    try {
      const response = await fetch('/api/stripe/create-checkout-session-reviews-test-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billing, customerInfo }),
      })
      const text = await response.text()
      let data = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch (_) {
        /* */
      }
      if (!response.ok || data.error) {
        throw new Error(
          data.error ||
            `Checkout init failed (${response.status}). ${text ? text.slice(0, 200) : 'Empty response.'}`,
        )
      }
      if (!data.clientSecret) throw new Error('No clientSecret returned from server.')
      setClientSecret(data.clientSecret)
    } catch (err) {
      setError(err.message)
    }
  }, [tier, billing, customerInfo])

  useEffect(() => {
    if (!clientSecret || !checkoutContainerRef.current) return
    let destroyed = false

    async function mountCheckout() {
      try {
        if (!stripePromise) {
          throw new Error('Stripe configuration error (NEXT_PUBLIC_REV_STRIPE_PUBLISHABLE_KEY missing).')
        }
        const stripe = await stripePromise
        if (!stripe || destroyed) return
        const checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret })
        if (destroyed) {
          checkout.destroy()
          return
        }
        checkoutInstanceRef.current = checkout
        checkout.mount(checkoutContainerRef.current)
        setCheckoutReady(true)
      } catch (err) {
        if (!destroyed) setError(err.message || 'Failed to load payment form.')
      }
    }
    mountCheckout()
    return () => {
      destroyed = true
      if (checkoutInstanceRef.current) {
        checkoutInstanceRef.current.destroy()
        checkoutInstanceRef.current = null
      }
      setCheckoutReady(false)
    }
  }, [clientSecret])

  return (
    <main>
      <ReviewsFunnelHeader currentStep={3} />
      <section style={{ padding: '40px 24px 80px', maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            background: '#fff5f5',
            border: '2px solid #a3403c',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px',
          }}
        >
          <p style={{ margin: 0, fontSize: '13px', color: '#a3403c', fontWeight: 'bold' }}>TEST-LIVE ORDER</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#0e2042', fontSize: '18px' }}>
            {tierDisplay?.name || tier} — {priceLabel}
          </p>
        </div>

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setStep(2)
              fetchClientSecret()
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <input
              type='text'
              placeholder='Test name'
              required
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              style={inputStyle}
            />
            <input
              type='email'
              placeholder='Test email'
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              style={inputStyle}
            />
            <input
              type='text'
              placeholder='Test company'
              required
              value={customerInfo.company}
              onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
              style={inputStyle}
            />
            <button
              type='submit'
              style={{
                background: '#a3403c',
                color: '#fff',
                padding: '14px',
                border: 'none',
                fontWeight: 'bold',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Continue to TEST Payment →
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            {error && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '4px',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}
            <div ref={checkoutContainerRef} style={{ minHeight: '400px' }} />
            {!checkoutReady && !error && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>Initializing Stripe…</div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

const inputStyle = { padding: '12px', border: '1px solid #d0d0d0', borderRadius: '4px', fontSize: '14px' }

export default function ReviewsTestLiveCheckout() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading…</div>}>
      <CheckoutInner />
    </Suspense>
  )
}
