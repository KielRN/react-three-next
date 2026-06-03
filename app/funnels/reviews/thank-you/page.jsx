'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ReviewsFunnelHeader from '../components/ReviewsFunnelHeader'

function ThankYouInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <main>
      <ReviewsFunnelHeader currentStep={3} />
      <section style={{ padding: '80px 24px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#1a8a4f',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            marginBottom: '24px',
          }}
        >
          ✓
        </div>
        <h1 style={{ color: '#0e2042', fontSize: '36px', margin: '0 0 16px' }}>
          You&apos;re in. Your 10-day trial starts now.
        </h1>
        <p style={{ color: '#555', fontSize: '18px', maxWidth: '540px', margin: '0 auto 32px', lineHeight: 1.5 }}>
          We&apos;ll send a welcome email shortly with onboarding details. You&apos;re not charged until day 11 — cancel
          anytime before then for $0.
        </p>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <h3 style={{ color: '#0e2042', fontSize: '18px', margin: '0 0 12px' }}>What happens next</h3>
          <ol style={{ color: '#555', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>You&apos;ll get a welcome email within 5 minutes with a link to book your onboarding call.</li>
            <li>On the call, we configure your review automation and connect your CRM.</li>
            <li>Within 48 hours, your first review requests go out to your customer list.</li>
          </ol>
        </div>

        <Link
          href='/'
          style={{
            display: 'inline-block',
            background: '#0e2042',
            color: '#ebcb4c',
            padding: '14px 32px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '6px',
          }}
        >
          Back to Texas AI
        </Link>

        {sessionId && <p style={{ marginTop: '32px', fontSize: '12px', color: '#aaa' }}>Reference: {sessionId}</p>}
      </section>
    </main>
  )
}

export default function ReviewsThankYouPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading…</div>}>
      <ThankYouInner />
    </Suspense>
  )
}
