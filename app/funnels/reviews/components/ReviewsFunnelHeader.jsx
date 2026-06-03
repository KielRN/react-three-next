'use client'

import Link from 'next/link'

const STEPS = [
  { num: 1, label: 'Learn More', path: '/funnels/reviews' },
  { num: 2, label: 'Choose Plan', path: '/funnels/reviews/pricing' },
  { num: 3, label: 'Checkout', path: '/funnels/reviews/checkout' },
]

export default function ReviewsFunnelHeader({ currentStep = 1 }) {
  return (
    <header
      style={{
        background: '#000',
        color: '#ebcb4c',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #ebcb4c',
      }}
    >
      <Link
        href='/'
        style={{ color: '#ebcb4c', textDecoration: 'none', fontWeight: 'bold', letterSpacing: '0.05em' }}
      >
        TEXAS AI ▸ REVIEWS
      </Link>
      <nav style={{ display: 'flex', gap: '24px' }}>
        {STEPS.map((s) => (
          <span
            key={s.num}
            style={{
              fontSize: '12px',
              opacity: currentStep === s.num ? 1 : 0.5,
              fontWeight: currentStep === s.num ? 'bold' : 'normal',
            }}
          >
            {s.num}. {s.label}
          </span>
        ))}
      </nav>
    </header>
  )
}
