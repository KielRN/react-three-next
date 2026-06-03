import Link from 'next/link'

export default function TestimonialPlaceholder() {
  return (
    <section
      style={{
        padding: '80px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0e2042 0%, #2c75ff 100%)',
          color: '#fff',
          padding: '48px 32px',
          borderRadius: '12px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: '#ebcb4c',
            color: '#0e2042',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '16px',
          }}
        >
          EARLY ACCESS
        </span>
        <h2 style={{ fontSize: '32px', margin: '0 0 16px' }}>Be one of our first 10 customers</h2>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 24px', opacity: 0.9 }}>
          Get 50% off your first 3 months and direct access to our team during setup. Limited to the first 10 Texas
          service businesses that sign up.
        </p>
        <Link
          href='/funnels/reviews/pricing'
          style={{
            display: 'inline-block',
            background: '#ebcb4c',
            color: '#0e2042',
            padding: '14px 32px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '6px',
          }}
        >
          Claim Early Access
        </Link>
      </div>
    </section>
  )
}
