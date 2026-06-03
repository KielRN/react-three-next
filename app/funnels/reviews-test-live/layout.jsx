import '../growth-platform/funnel.css'

export const metadata = {
  title: 'Texas AI Reviews — TEST LIVE',
  description: 'Internal LIVE-mode smoke test funnel. Not for real orders.',
  robots: 'noindex, nofollow',
}

export default function ReviewsTestLiveLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Space Mono', monospace" }}>
      <div
        style={{
          background: '#a3403c',
          color: '#fff',
          padding: '12px 24px',
          textAlign: 'center',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          fontSize: '13px',
        }}
      >
        ⚠ TEST PAGE — LIVE Stripe wiring smoke test. No real orders. ⚠
      </div>
      {children}
    </div>
  )
}
