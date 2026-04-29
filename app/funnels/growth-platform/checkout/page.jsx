'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import FunnelHeader from '../components/FunnelHeader'
import TrustBadges from '../components/TrustBadges'
import { STRIPE_CONFIG } from '../stripe-config'

// Initialize Stripe outside component to avoid re-creation
const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

export default function GrowthPlatformCheckout() {
  const [customerInfo, setCustomerInfo] = useState(null)
  const [step, setStep] = useState(1) // 1: Contact, 2: Payment
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')
  const [checkoutReady, setCheckoutReady] = useState(false)
  const checkoutContainerRef = useRef(null)
  const checkoutInstanceRef = useRef(null)

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('gp_customer_info')
    if (saved) {
      setCustomerInfo(JSON.parse(saved))
    }
  }, [])

  // Initialize Checkout Session
  const fetchClientSecret = useCallback(async () => {
    if (!customerInfo) return
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: customerInfo.plan || 'monthly',
          customerInfo: customerInfo
        }),
      })

      const text = await response.text()
      let data = {}
      try { data = text ? JSON.parse(text) : {} } catch (_) { /* non-JSON body */ }

      if (!response.ok || data.error) {
        throw new Error(data.error || `Checkout init failed (${response.status}). ${text ? text.slice(0, 200) : 'Empty response from server.'}`)
      }
      if (!data.clientSecret) throw new Error('No clientSecret returned from server.')
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message)
    }
  }, [customerInfo])

  // Mount Stripe Embedded Checkout using the new createEmbeddedCheckoutPage API
  useEffect(() => {
    if (!clientSecret || !checkoutContainerRef.current) return

    let destroyed = false

    async function mountCheckout() {
      try {
        if (!stripePromise) {
          throw new Error('Stripe configuration error. Please contact support.')
        }
        const stripe = await stripePromise
        if (!stripe || destroyed) return

        // Use the new API method (replaces deprecated initEmbeddedCheckout)
        const checkout = await stripe.createEmbeddedCheckoutPage({
          clientSecret,
        })

        if (destroyed) {
          checkout.destroy()
          return
        }

        checkoutInstanceRef.current = checkout
        checkout.mount(checkoutContainerRef.current)
        setCheckoutReady(true)
      } catch (err) {
        console.error('Stripe mount error:', err)
        if (!destroyed) {
          setError(err.message || 'Failed to load payment form. Please refresh and try again.')
        }
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

  const handleStep1Complete = (e) => {
    e.preventDefault()
    setStep(2)
    fetchClientSecret()
  }

  if (!customerInfo && typeof window !== 'undefined') {
    return (
      <main className="section-txai" style={{ textAlign: 'center' }}>
        <p>No agreement found. Please start from the beginning.</p>
        <a href="/funnels/growth-platform" className="btn-solid-txai">GO BACK</a>
      </main>
    )
  }

  return (
    <main className="section-txai">
      <FunnelHeader currentStep={3} />

      <div className="section-container-txai animate-fade-up-txai" style={{ marginTop: '40px', maxWidth: '800px' }}>
        
        {/* 2-Step Progress Header */}
        <div className="order-form-steps">
          <div 
            className={`order-form-step ${step === 1 ? 'active' : ''}`}
            onClick={() => step === 2 && setStep(1)}
          >
            <p className="step-title">STEP #1</p>
            <p className="step-subtitle">Contact Information</p>
          </div>
          <div className={`order-form-step ${step === 2 ? 'active' : ''}`}>
            <p className="step-title">STEP #2</p>
            <p className="step-subtitle">Payment Details</p>
          </div>
        </div>

        {/* STEP 1: CONTACT INFO (REVIEW) */}
        <div className={`step-content ${step === 1 ? 'active' : ''}`}>
          <h3 style={{ marginBottom: '20px' }}>Review Your Details</h3>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>NAME</label>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{customerInfo?.firstName} {customerInfo?.lastName}</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>BUSINESS</label>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{customerInfo?.businessName}</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>EMAIL</label>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{customerInfo?.email}</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#888' }}>PHONE</label>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{customerInfo?.phone}</p>
              </div>
            </div>
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
              <label style={{ fontSize: '11px', color: '#888' }}>SELECTED PLAN</label>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2c75ff', textTransform: 'uppercase' }}>
                {customerInfo?.plan} LICENSE
              </p>
            </div>
          </div>

          <button onClick={handleStep1Complete} className="btn-cta-txai primary">
            GO TO STEP #2: PAYMENT DETAILS →
          </button>
        </div>

        {/* STEP 2: STICKY PAYMENT ELEMENT */}
        <div className={`step-content ${step === 2 ? 'active' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Payment Information</h3>
            <button 
              onClick={() => setStep(1)} 
              style={{ background: 'none', border: 'none', color: '#2c75ff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
            >
              ← EDIT DETAILS
            </button>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '15px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
              Error: {error}
            </div>
          )}

          <div style={{ minHeight: '400px' }}>
            {/* Stripe Embedded Checkout mounts here */}
            <div ref={checkoutContainerRef} />
            
            {/* Show spinner while loading */}
            {!checkoutReady && !error && (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ 
                  display: 'inline-block', width: '40px', height: '40px', 
                  border: '4px solid #f3f3f3', borderTop: '4px solid #2c75ff', 
                  borderRadius: '50%', animation: 'spin 1s linear infinite' 
                }} />
                <p style={{ marginTop: '20px', color: '#666' }}>Securely initializing Stripe...</p>
                <style jsx>{`
                  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}</style>
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '12px', color: '#888' }}>
              🔒 256-Bit SSL Encrypted Standard. 100% Secure &amp; Private.
            </p>
          </div>
        </div>

        <TrustBadges />
      </div>
    </main>
  )
}
