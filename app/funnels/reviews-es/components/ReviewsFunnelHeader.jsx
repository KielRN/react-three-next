'use client'

import Link from 'next/link'

const STEPS = [
  { num: 1, label: 'Aprende Más', path: '/funnels/reviews-es' },
  { num: 2, label: 'Elige Plan', path: '/funnels/reviews-es/precios' },
  { num: 3, label: 'Pago', path: '/funnels/reviews-es/pago' },
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
        TEXAS AI ▸ RESEÑAS
      </Link>
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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
        <Link
          href='/funnels/reviews'
          style={{
            fontSize: '11px',
            color: '#ebcb4c',
            opacity: 0.7,
            textDecoration: 'underline',
            letterSpacing: '0.05em',
          }}
        >
          EN
        </Link>
      </nav>
    </header>
  )
}
