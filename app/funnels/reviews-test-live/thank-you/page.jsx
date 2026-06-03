'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReviewsFunnelHeader from '../../reviews/components/ReviewsFunnelHeader'

function ThankYouInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <main>
      <ReviewsFunnelHeader currentStep={3} />
      <section style={{ padding: '80px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#a3403c', fontSize: '32px', marginBottom: '16px' }}>TEST checkout complete</h1>
        <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
          This was a TEST-LIVE smoke test. <strong>Refund the charge in the Stripe dashboard now</strong> to avoid
          leaving a real $1.50–$5.50 charge on the test card.
        </p>
        <Link
          href='https://dashboard.stripe.com/payments'
          target='_blank'
          rel='noreferrer'
          style={{
            background: '#a3403c',
            color: '#fff',
            padding: '14px 32px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'inline-block',
          }}
        >
          Open Stripe Dashboard
        </Link>
        {sessionId && <p style={{ marginTop: '24px', fontSize: '12px', color: '#aaa' }}>Session: {sessionId}</p>}
      </section>
    </main>
  )
}

export default function ReviewsTestLiveThankYou() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading…</div>}>
      <ThankYouInner />
    </Suspense>
  )
}
