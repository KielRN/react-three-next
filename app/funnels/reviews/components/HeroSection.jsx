import Link from 'next/link'

export default function HeroSection() {
  return (
    <section style={{ padding: '80px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
        <div>
          <span
            style={{
              display: 'inline-block',
              background: '#000',
              color: '#ebcb4c',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              marginBottom: '24px',
            }}
          >
            REVIEW AUTOMATION
          </span>
          <h1 style={{ fontSize: '48px', lineHeight: 1.1, margin: '0 0 24px', color: '#0e2042' }}>
            Review Automation for Service Businesses That Want to Be Found First on Google
          </h1>
          <p style={{ fontSize: '18px', color: '#555', lineHeight: 1.5, marginBottom: '32px' }}>
            Start getting the reviews you deserve. Start ranking higher on Google. Start getting chosen over your
            competition.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href='/funnels/reviews/pricing'
              style={{
                background: '#0e2042',
                color: '#ebcb4c',
                padding: '14px 28px',
                fontWeight: 'bold',
                textDecoration: 'none',
                borderRadius: '6px',
              }}
            >
              Start 10-Day Free Trial
            </Link>
            <Link
              href='/funnels/reviews/demo'
              style={{
                background: '#fff',
                color: '#0e2042',
                border: '2px solid #0e2042',
                padding: '12px 28px',
                fontWeight: 'bold',
                textDecoration: 'none',
                borderRadius: '6px',
              }}
            >
              Book a Demo
            </Link>
          </div>
          <p style={{ marginTop: '24px', fontSize: '13px', color: '#888' }}>
            No credit card surprise. Cancel anytime during your 10-day trial.
          </p>
        </div>
        <div
          style={{
            aspectRatio: '16 / 9',
            background: 'linear-gradient(135deg, #ebcb4c 0%, #2c75ff 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            letterSpacing: '0.1em',
          }}
        >
          [VIDEO PLACEHOLDER]
        </div>
      </div>
    </section>
  )
}
