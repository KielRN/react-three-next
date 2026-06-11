const SOLUTIONS = [
  {
    title: 'Gana Más Clientes',
    body: 'La gente confía en los negocios con buenas reseñas, y la reputación correcta te convierte en la opción obvia.',
    icon: '👥',
  },
  {
    title: 'Sube en Búsquedas Locales',
    body: 'Las reseñas ayudan a tu negocio a subir en los resultados de Google, poniéndote frente a más compradores.',
    icon: '📈',
  },
  {
    title: 'Genera Confianza al Instante',
    body: 'La prueba social de clientes contentos le da seguridad a los prospectos para elegirte sobre la competencia.',
    icon: '🤝',
  },
  {
    title: 'Destaca en Google',
    body: 'Las reseñas convierten a tu negocio en la opción obvia frente a tu competencia.',
    icon: '⭐',
  },
]

export default function SolutionGrid() {
  return (
    <section style={{ padding: '80px 24px', background: '#fafafa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '36px', textAlign: 'center', color: '#0e2042', marginBottom: '16px' }}>
          Cómo lo solucionamos con reseñas
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '48px', maxWidth: '720px', margin: '0 auto 48px' }}>
          Las reseñas son una de las palancas de crecimiento más desaprovechadas en cualquier negocio. Antes era un
          proceso lento y pesado. Como tu socio de reseñas de confianza, lo dejamos andando para que nunca más tengas
          que preocuparte.
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
