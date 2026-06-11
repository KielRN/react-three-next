'use client'

import { useState } from 'react'
import ReviewsFunnelHeader from '../components/ReviewsFunnelHeader'
import BillingToggle from '../components/BillingToggle'
import PricingCards from '../components/PricingCards'
import FAQSection from '../components/FAQSection'

export default function ReviewsEsPricingPage() {
  const [billing, setBilling] = useState('monthly')

  return (
    <main>
      <ReviewsFunnelHeader currentStep={2} />

      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '44px', color: '#0e2042', margin: '0 0 16px' }}>Precios que crecen contigo</h1>
        <p style={{ color: '#666', maxWidth: '720px', margin: '0 auto 32px', lineHeight: 1.5 }}>
          El precio se basa en el número de solicitudes nuevas que quieres enviar cada mes. Todos los planes incluyen 1
          reactivación inicial donde superamos tu límite mensual. Los mensajes de seguimiento están incluidos y no
          cuentan para el límite mensual.
        </p>
        <BillingToggle value={billing} onChange={setBilling} />
      </section>

      <section style={{ padding: '0 24px 80px' }}>
        <PricingCards billing={billing} funnelBase='/funnels/reviews-es' />
      </section>

      <FAQSection />
    </main>
  )
}
