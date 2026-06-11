const STEPS = [
  {
    when: 'Hoy',
    title: 'Regístrate y reactiva',
    body: 'Configuramos todo en minutos y agendas una llamada con nuestro equipo. Conectamos tu CRM y empezamos tu campaña de reactivación.',
  },
  {
    when: 'Día 3',
    title: 'Las reseñas empiezan a llegar',
    body: 'Tus clientes anteriores empezarán a dejarte esas reseñas que tanto cuesta conseguir, y nosotros respondemos y publicamos en redes sociales por ti. Sin que tengas que preocuparte.',
  },
  {
    when: 'Día 7',
    title: 'Gana trabajos de nuevo',
    body: 'Tu negocio sube en Google y te encuentran más rápido gracias a las nuevas reseñas. Pasas menos tiempo convenciendo prospectos y más tiempo cerrando trabajos.',
  },
]

export default function HowItWorksTimeline() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '48px', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '36px', color: '#0e2042', marginBottom: '16px' }}>Impulsa tu negocio de servicios</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Lo que podrías lograr en solo 7 días al sumar Texas AI Reseñas a tu negocio.
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
              Ejemplo: un cliente de 2 años pasó de 23 a 1,025 reseñas
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
