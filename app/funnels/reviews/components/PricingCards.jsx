'use client'

import Link from 'next/link'
import { REVIEWS_STRIPE_CONFIG } from '../stripe-config'
import FeatureChecklist from './FeatureChecklist'

const TIER_ORDER = ['starter', 'growth', 'pro']

/**
 * `billing` is 'monthly' or 'annual'.
 * `funnelBase` is '/funnels/reviews' or '/funnels/reviews-test-live'.
 */
export default function PricingCards({ billing = 'monthly', funnelBase = '/funnels/reviews' }) {
  const { display, features, trial } = REVIEWS_STRIPE_CONFIG

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}
    >
      {TIER_ORDER.map((tierKey) => {
        const tier = display[tierKey]
        const price = billing === 'monthly' ? tier.priceMonthly : tier.priceAnnual
        const cadence = billing === 'monthly' ? '/monthly' : '/yearly'
        const isPopular = tier.popular

        return (
          <div
            key={tierKey}
            style={{
              background: isPopular ? '#0e2042' : '#fff',
              color: isPopular ? '#fff' : '#0e2042',
              border: isPopular ? '2px solid #ebcb4c' : '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '32px',
              position: 'relative',
              transform: isPopular ? 'scale(1.02)' : 'none',
              boxShadow: isPopular ? '0 12px 32px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            {isPopular && (
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#ebcb4c',
                  color: '#0e2042',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                }}
              >
                POPULAR
              </span>
            )}

            <h3 style={{ fontSize: '32px', margin: '0 0 8px', color: isPopular ? '#ebcb4c' : '#0e2042' }}>
              {tier.name}
            </h3>
            <p style={{ fontSize: '14px', color: isPopular ? '#ccc' : '#888', marginBottom: '24px' }}>{tier.volume}</p>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '44px', fontWeight: 'bold' }}>{price}</span>
              <span style={{ fontSize: '14px', opacity: 0.7 }}>{cadence}</span>
            </div>

            <p
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: isPopular ? '#ebcb4c' : '#0e2042',
              }}
            >
              What&apos;s included
            </p>
            <FeatureChecklist
              features={features}
              color={isPopular ? '#ebcb4c' : '#1a8a4f'}
              textColor={isPopular ? '#ffffff' : '#333'}
            />

            <Link
              href={`${funnelBase}/checkout?tier=${tierKey}&billing=${billing}`}
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '24px',
                padding: '14px 24px',
                background: isPopular ? '#ebcb4c' : '#0e2042',
                color: isPopular ? '#0e2042' : '#fff',
                fontWeight: 'bold',
                textDecoration: 'none',
                borderRadius: '6px',
              }}
            >
              {trial.ctaLabel}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
