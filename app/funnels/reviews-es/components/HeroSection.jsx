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
            AUTOMATIZACIÓN DE RESEÑAS
          </span>
          <h1 style={{ fontSize: '48px', lineHeight: 1.1, margin: '0 0 24px', color: '#0e2042' }}>
            Automatización de Reseñas para Negocios de Servicio que Quieren Salir Primero en Google
          </h1>
          <p style={{ fontSize: '18px', color: '#555', lineHeight: 1.5, marginBottom: '32px' }}>
            Empieza a recibir las reseñas que te mereces. Empieza a posicionarte más alto en Google. Empieza a ser el
            elegido sobre la competencia.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href='/funnels/reviews-es/precios'
              style={{
                background: '#0e2042',
                color: '#ebcb4c',
                padding: '14px 28px',
                fontWeight: 'bold',
                textDecoration: 'none',
                borderRadius: '6px',
              }}
            >
              Empieza Tu Prueba Gratis de 10 Días
            </Link>
            <a
              href='https://link.texasaiconsulting.com/widget/booking/uuJHOQrN5564Px31JrBi'
              target='_blank'
              rel='noreferrer'
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
              Agenda una Demo
            </a>
          </div>
          <p style={{ marginTop: '24px', fontSize: '13px', color: '#888' }}>
            Sin sorpresas en tu tarjeta. Cancela cuando quieras durante tu prueba de 10 días.
          </p>
        </div>
        <div
          style={{
            aspectRatio: '16 / 9',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(14, 32, 66, 0.15)',
          }}
        >
          <iframe
            src='https://www.youtube.com/embed/Wj2QqMCQ15A'
            title='Texas AI Servicio de Reseñas'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </div>
    </section>
  )
}
