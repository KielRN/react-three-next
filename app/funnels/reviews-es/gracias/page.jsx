import Link from 'next/link'
import ReviewsFunnelHeader from '../components/ReviewsFunnelHeader'

export default function ReviewsEsThankYouPage() {
  return (
    <main>
      <ReviewsFunnelHeader currentStep={3} />
      <section style={{ padding: '80px 24px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#1a8a4f',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            marginBottom: '24px',
          }}
        >
          ✓
        </div>
        <h1 style={{ color: '#0e2042', fontSize: '36px', margin: '0 0 16px' }}>
          ¡Listo! Tu prueba de 10 días empieza ahora.
        </h1>
        <p style={{ color: '#555', fontSize: '18px', maxWidth: '540px', margin: '0 auto 32px', lineHeight: 1.5 }}>
          Te mandamos un correo de bienvenida en un momento con los detalles de configuración. No te cobramos nada hasta
          el día 11 — cancela cuando quieras antes de esa fecha y tu total será $0.
        </p>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <h3 style={{ color: '#0e2042', fontSize: '18px', margin: '0 0 12px' }}>Qué sigue</h3>
          <ol style={{ color: '#555', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>En menos de 5 minutos recibes un correo de bienvenida con un enlace para agendar tu llamada de configuración.</li>
            <li>En la llamada configuramos tu automatización de reseñas y conectamos tu CRM.</li>
            <li>En menos de 48 horas, tus primeras solicitudes de reseñas salen a tu lista de clientes.</li>
          </ol>
        </div>

        <div
          style={{
            background: '#fff7d6',
            border: '1px solid #ebcb4c',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px',
            textAlign: 'left',
            color: '#5a4500',
          }}
        >
          <h3 style={{ color: '#0e2042', fontSize: '16px', margin: '0 0 8px' }}>¿Necesitas cancelar?</h3>
          <p style={{ margin: 0, lineHeight: 1.5, fontSize: '14px' }}>
            Manda un correo a{' '}
            <a
              href='mailto:support@texasaiconsulting.com?subject=CANCELAR%20Prueba%20de%20Resenas'
              style={{ color: '#0e2042', fontWeight: 'bold' }}
            >
              support@texasaiconsulting.com
            </a>{' '}
            con la palabra <strong>CANCELAR</strong> antes del día 11 y tu prueba termina sin costo. Después del día 11,
            el mismo correo cancela al final de tu ciclo de facturación actual.
          </p>
        </div>

        <Link
          href='/'
          style={{
            display: 'inline-block',
            background: '#0e2042',
            color: '#ebcb4c',
            padding: '14px 32px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '6px',
          }}
        >
          Volver a Texas AI
        </Link>
      </section>
    </main>
  )
}
