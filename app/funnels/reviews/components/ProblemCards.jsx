const PROBLEMS = [
  {
    title: 'No Reviews',
    body: 'You have lots of happy customers but only a few reviews to show for it. So you have to prove yourself to new leads.',
    accent: '#888',
  },
  {
    title: 'No Time',
    body: "As a business owner, you don't have the time to chase customers down to ask for a review. You're wearing enough hats already.",
    accent: '#b8a05a',
  },
  {
    title: 'No Visibility On Google',
    body: "Your ideal customers are choosing your competition over you just because of their reviews. You know you do better work, but new customers don't.",
    accent: '#a3403c',
  },
]

export default function ProblemCards() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '36px', textAlign: 'center', color: '#0e2042', marginBottom: '16px' }}>
        Your Business Deserves More Reviews
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '48px' }}>
        Your customers are happy. You make sure the job is done right. But when it comes time to get a review… crickets.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {PROBLEMS.map((p) => (
          <div
            key={p.title}
            style={{
              background: '#fff',
              border: `2px solid ${p.accent}`,
              borderRadius: '8px',
              padding: '32px',
              minHeight: '240px',
            }}
          >
            <h3 style={{ color: p.accent, fontSize: '24px', marginBottom: '16px' }}>{p.title}</h3>
            <p style={{ color: '#444', lineHeight: 1.5 }}>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
