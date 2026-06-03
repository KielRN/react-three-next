const STEPS = [
  {
    when: 'Today',
    title: 'Sign up and reactivate',
    body: 'Onboard in minutes and book a setup call with our team. Connect to your existing CRM and start your reactivation campaign.',
  },
  {
    when: 'Day 3',
    title: 'Reviews start rolling in',
    body: 'Your previous customers will start leaving you those hard-earned reviews and we reply and repost to social media for you. No need to worry.',
  },
  {
    when: 'Day 7',
    title: 'Win jobs again',
    body: "Your business will rank higher on Google and be seen faster thanks to the new reviews. You'll spend less time building trust with leads, and more time closing deals.",
  },
]

export default function HowItWorksTimeline() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '48px', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '36px', color: '#0e2042', marginBottom: '16px' }}>Boost your service business</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            What you could achieve in just 7 days by adding Texas AI Reviews to your business.
          </p>
          <div
            style={{
              background: '#f0f9f4',
              border: '1px solid #d0e8d8',
              borderRadius: '8px',
              padding: '24px',
            }}
          >
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a8a4f', margin: 0 }}>+4,356%</p>
            <p style={{ color: '#1a8a4f', fontSize: '13px', marginTop: '4px' }}>
              Example: a 2-year customer went from 23 to 1,025 reviews
            </p>
          </div>
        </div>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: '2px solid #ebcb4c' }}>
          {STEPS.map((s) => (
            <li key={s.when} style={{ paddingLeft: '24px', marginBottom: '32px', position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '-9px',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#ebcb4c',
                }}
              />
              <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>{s.when}</p>
              <h3 style={{ color: '#0e2042', fontSize: '22px', margin: '4px 0 8px' }}>{s.title}</h3>
              <p style={{ color: '#555', lineHeight: 1.5, margin: 0 }}>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
