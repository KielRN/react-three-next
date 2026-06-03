'use client'

import { useState } from 'react'
import ReviewsFunnelHeader from '../components/ReviewsFunnelHeader'
import BillingToggle from '../components/BillingToggle'
import PricingCards from '../components/PricingCards'
import FAQSection from '../components/FAQSection'

export default function ReviewsPricingPage() {
  const [billing, setBilling] = useState('monthly')

  return (
    <main>
      <ReviewsFunnelHeader currentStep={2} />

      <section style={{ padding: '80px 24px 40px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '44px', color: '#0e2042', margin: '0 0 16px' }}>Pricing that scales with you</h1>
        <p style={{ color: '#666', maxWidth: '720px', margin: '0 auto 32px', lineHeight: 1.5 }}>
          Pricing is based on the number of new requests you&apos;d like to send each month. All plans include 1 initial
          review reactivation where we exceed your monthly limit. Follow-up messages are included and not counted toward
          requests per month.
        </p>
        <BillingToggle value={billing} onChange={setBilling} />
      </section>

      <section style={{ padding: '0 24px 80px' }}>
        <PricingCards billing={billing} funnelBase='/funnels/reviews' />
      </section>

      <FAQSection />
    </main>
  )
}
