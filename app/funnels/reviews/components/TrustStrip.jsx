export default function TrustStrip() {
  return (
    <section
      style={{
        padding: '32px 24px',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        background: '#fafafa',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', letterSpacing: '0.05em' }}>
          Trusted by Texas businesses
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '48px',
            flexWrap: 'wrap',
            opacity: 0.6,
          }}
        >
          {['CLIENT A', 'CLIENT B', 'CLIENT C', 'CLIENT D', 'CLIENT E'].map((c) => (
            <span key={c} style={{ fontWeight: 'bold', fontSize: '14px', color: '#999' }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
