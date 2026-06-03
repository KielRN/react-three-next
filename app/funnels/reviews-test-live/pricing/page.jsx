'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReviewsFunnelHeader from '../../reviews/components/ReviewsFunnelHeader'
import BillingToggle from '../../reviews/components/BillingToggle'
import FeatureChecklist from '../../reviews/components/FeatureChecklist'
import { REVIEWS_TEST_LIVE_STRIPE_CONFIG } from '../stripe-config'

const TIER_ORDER = ['starter', 'growth', 'pro']

export default function ReviewsTestLivePricing() {
  const [billing, setBilling] = useState('monthly')
  const { display, features } = REVIEWS_TEST_LIVE_STRIPE_CONFIG

  return (
    <main>
      <ReviewsFunnelHeader currentStep={2} />
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#0e2042', fontSize: '36px', marginBottom: '16px' }}>
          TEST-LIVE Pricing ($1.50 / $5.50)
        </h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>
          These prices are real LIVE Stripe products at trivial cost. Use to verify wiring end-to-end with a real card,
          then refund.
        </p>
        <BillingToggle value={billing} onChange={setBilling} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '32px',
          }}
        >
          {TIER_ORDER.map((tierKey) => {
            const tier = display[tierKey]
            const price = billing === 'monthly' ? tier.priceMonthly : tier.priceAnnual
            return (
              <div
                key={tierKey}
                style={{
                  background: '#fff',
                  border: '2px solid #a3403c',
                  borderRadius: '12px',
                  padding: '32px',
                }}
              >
                <h3 style={{ color: '#a3403c', fontSize: '24px', marginBottom: '8px' }}>{tier.name}</h3>
                <p style={{ color: '#888', marginBottom: '24px' }}>{tier.volume}</p>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 'bold' }}>{price}</span>
                  <span style={{ fontSize: '13px' }}>{billing === 'monthly' ? '/monthly' : '/yearly'}</span>
                </div>
                <FeatureChecklist features={features} color='#a3403c' />
                <Link
                  href={`/funnels/reviews-test-live/checkout?tier=${tierKey}&billing=${billing}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '24px',
                    padding: '14px',
                    background: '#a3403c',
                    color: '#fff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    borderRadius: '6px',
                  }}
                >
                  Run TEST Checkout
                </Link>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
