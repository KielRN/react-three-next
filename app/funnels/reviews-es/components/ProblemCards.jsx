const PROBLEMS = [
  {
    title: 'Sin Reseñas',
    body: 'Tienes muchos clientes contentos pero pocas reseñas que lo demuestren. Así te toca probarte ante cada nuevo cliente desde cero.',
    accent: '#888',
  },
  {
    title: 'Sin Tiempo',
    body: 'Como dueño de un negocio, no tienes tiempo para andar persiguiendo clientes pidiendo reseñas. Ya traes suficientes sombreros puestos.',
    accent: '#b8a05a',
  },
  {
    title: 'Sin Visibilidad en Google',
    body: 'Tus clientes ideales están eligiendo a la competencia solo por sus reseñas. Tú sabes que haces mejor trabajo, pero los nuevos clientes no.',
    accent: '#a3403c',
  },
]

export default function ProblemCards() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '36px', textAlign: 'center', color: '#0e2042', marginBottom: '16px' }}>
        Tu Negocio Merece Más Reseñas
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '48px' }}>
        Tus clientes están contentos. Tú te aseguras de que el trabajo quede bien. Pero cuando llega el momento de pedir
        una reseña… nada, ni un pío.
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
