const SOLUTIONS = [
  {
    title: 'Win More Customers',
    body: 'People trust businesses with strong reviews, and the right reputation makes you the obvious choice.',
    icon: '👥',
  },
  {
    title: 'Boost Local Rankings',
    body: 'Reviews help your business climb Google search results, putting you in front of more buyers.',
    icon: '📈',
  },
  {
    title: 'Build Trust Instantly',
    body: 'Social proof from happy customers gives prospects confidence to choose you over competitors.',
    icon: '🤝',
  },
  {
    title: 'Stand Out On Google',
    body: 'Reviews make your business the obvious choice over your competition.',
    icon: '⭐',
  },
]

export default function SolutionGrid() {
  return (
    <section style={{ padding: '80px 24px', background: '#fafafa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', textAlign: 'center', color: '#0e2042', marginBottom: '16px' }}>
          How we fix that with reviews
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '48px', maxWidth: '720px', margin: '0 auto 48px' }}>
          Reviews are one of the most under-utilized growth levers in any business&apos;s toolbox. In the past, this was
          a time-consuming and slow process. As your trusted review partner, we get it running so you never worry about
          reviews again.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {SOLUTIONS.map((s) => (
            <div key={s.title} style={{ padding: '24px', borderLeft: '4px solid #ebcb4c' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{s.icon}</div>
              <h3 style={{ color: '#0e2042', fontSize: '20px', marginBottom: '12px' }}>{s.title}</h3>
              <p style={{ color: '#555', lineHeight: 1.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
