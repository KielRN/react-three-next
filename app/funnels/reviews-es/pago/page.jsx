'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import ReviewsFunnelHeader from '../components/ReviewsFunnelHeader'
import CheckoutTrustBlock from '../../reviews/components/CheckoutTrustBlock'
import { REVIEWS_ES_STRIPE_CONFIG } from '../stripe-config'

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

function CheckoutInner() {
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier') || 'growth'
  const billing = searchParams.get('billing') || 'monthly'
  const tierDisplay = REVIEWS_ES_STRIPE_CONFIG.display[tier]
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
      const response = await fetch('/api/stripe/create-checkout-session-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billing, customerInfo, lang: 'es' }),
      })
      const text = await response.text()
      let data = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch (_) {
        /* non-JSON body */
      }
      if (!response.ok || data.error) {
        throw new Error(
          data.error ||
            `Error al iniciar el pago (${response.status}). ${text ? text.slice(0, 200) : 'Respuesta vacía.'}`,
        )
      }
      if (!data.clientSecret) throw new Error('El servidor no devolvió clientSecret.')
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error('Reviews-ES checkout error:', err)
      setError(err.message)
    }
  }, [tier, billing, customerInfo])

  useEffect(() => {
    if (!clientSecret || !checkoutContainerRef.current) return
    let destroyed = false

    async function mountCheckout() {
      try {
        if (!stripePromise) {
          throw new Error(
            'Error de configuración de Stripe (falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY). Por favor contacta a soporte.',
          )
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
        console.error('Stripe mount error:', err)
        if (!destroyed) setError(err.message || 'No se pudo cargar el formulario de pago.')
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

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setStep(2)
    fetchClientSecret()
  }

  return (
    <main>
      <ReviewsFunnelHeader currentStep={3} />

      <section style={{ padding: '40px 24px 80px', maxWidth: '720px', margin: '0 auto' }}>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>TU PLAN</p>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#0e2042', fontSize: '18px' }}>
              Texas AI Reseñas — {tierDisplay?.name || tier}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>{tierDisplay?.volume}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#0e2042' }}>{priceLabel}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
              {billing === 'monthly' ? '/mes' : '/año'} · prueba gratis de 14 días
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <span style={{ fontWeight: step === 1 ? 'bold' : 'normal', color: step === 1 ? '#0e2042' : '#888' }}>
            1. Tus datos
          </span>
          <span style={{ color: '#ccc' }}>→</span>
          <span style={{ fontWeight: step === 2 ? 'bold' : 'normal', color: step === 2 ? '#0e2042' : '#888' }}>
            2. Pago
          </span>
        </div>

        {step === 1 && (
          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field
              label='Nombre completo'
              required
              value={customerInfo.name}
              onChange={(v) => setCustomerInfo({ ...customerInfo, name: v })}
            />
            <Field
              label='Correo electrónico'
              type='email'
              required
              value={customerInfo.email}
              onChange={(v) => setCustomerInfo({ ...customerInfo, email: v })}
            />
            <Field
              label='Negocio'
              required
              value={customerInfo.company}
              onChange={(v) => setCustomerInfo({ ...customerInfo, company: v })}
            />
            <Field
              label='Teléfono (opcional)'
              type='tel'
              value={customerInfo.phone}
              onChange={(v) => setCustomerInfo({ ...customerInfo, phone: v })}
            />
            <button
              type='submit'
              style={{
                background: '#0e2042',
                color: '#ebcb4c',
                padding: '14px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Continuar al Pago →
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
                  fontSize: '14px',
                }}
              >
                Error: {error}
              </div>
            )}
            <div ref={checkoutContainerRef} style={{ minHeight: '400px' }} />
            {!checkoutReady && !error && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                Inicializando Stripe de forma segura…
              </div>
            )}
            <button
              type='button'
              onClick={() => setStep(1)}
              style={{
                marginTop: '16px',
                background: 'none',
                border: 'none',
                color: '#2c75ff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ← Editar datos
            </button>
          </div>
        )}

        <CheckoutTrustBlock lang='es' />
      </section>
    </main>
  )
}

function Field({ label, type = 'text', required, value, onChange }) {
  return (
    <label style={{ fontSize: '14px', color: '#0e2042', fontWeight: 'bold' }}>
      {label}
      {required && <span style={{ color: '#a00' }}> *</span>}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          marginTop: '4px',
          padding: '12px',
          width: '100%',
          border: '1px solid #d0d0d0',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      />
    </label>
  )
}

export default function ReviewsEsCheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Cargando…</div>}>
      <CheckoutInner />
    </Suspense>
  )
}
