import Image from 'next/image'

const COPY = {
  en: {
    trialBadge: 'NO CHARGE TODAY',
    trialHeadline: 'You won’t be charged until day 11.',
    trialBody:
      'Your card is held by Stripe for the 10-day free trial. Cancel anytime before day 11 by emailing support@texasaiconsulting.com — your total will be $0.',
    guaranteeBadge: 'SATISFACTION GUARANTEE',
    guaranteeHeadline: 'Not getting more reviews? Your money back.',
    guaranteeBody:
      'If we don’t increase your review volume in your first 30 days as a paying customer, email us and we’ll refund your first month — no questions asked.',
    benefits: [
      { title: 'Cancel anytime', body: 'No contracts. End your subscription with a single email at any time.' },
      { title: 'Secure checkout', body: 'Payments processed by Stripe with 256-bit SSL encryption. We never see your card details.' },
      { title: 'Real human support', body: 'A Texas-based onboarding specialist sets up your account within 48 hours.' },
      { title: 'Your data stays yours', body: 'We never sell your customer list. Export everything anytime.' },
    ],
    badges: ['10-Day Free Trial', 'Cancel Anytime', 'Secure Stripe Checkout', 'Satisfaction Guarantee', 'No Setup Fee'],
    secureLabel: 'Secure SSL Checkout',
    supportLine: 'Questions before you buy?',
    supportEmail: 'support@texasaiconsulting.com',
  },
  es: {
    trialBadge: 'HOY NO TE COBRAMOS',
    trialHeadline: 'No te cobramos nada hasta el día 11.',
    trialBody:
      'Stripe guarda tu tarjeta durante los 10 días de prueba gratis. Cancela cuando quieras antes del día 11 mandando un correo a support@texasaiconsulting.com — tu total será $0.',
    guaranteeBadge: 'GARANTÍA DE SATISFACCIÓN',
    guaranteeHeadline: '¿No te están llegando más reseñas? Te devolvemos tu dinero.',
    guaranteeBody:
      'Si no aumentamos el volumen de tus reseñas en tus primeros 30 días como cliente, escríbenos y te devolvemos el primer mes — sin preguntas.',
    benefits: [
      { title: 'Cancela cuando quieras', body: 'Sin contratos. Termina tu suscripción con un solo correo en cualquier momento.' },
      { title: 'Pago seguro', body: 'Procesado por Stripe con encriptación SSL de 256 bits. Nunca vemos los datos de tu tarjeta.' },
      { title: 'Soporte humano de verdad', body: 'Un especialista en Texas configura tu cuenta en menos de 48 horas.' },
      { title: 'Tu información es tuya', body: 'Nunca vendemos tu lista de clientes. Exporta todo cuando quieras.' },
    ],
    badges: ['Prueba Gratis de 10 Días', 'Cancela Cuando Quieras', 'Pago Seguro con Stripe', 'Garantía de Satisfacción', 'Sin Cuota de Configuración'],
    secureLabel: 'Pago Seguro SSL',
    supportLine: '¿Tienes preguntas antes de comprar?',
    supportEmail: 'support@texasaiconsulting.com',
  },
}

export default function CheckoutTrustBlock({ lang = 'en' }) {
  const t = COPY[lang] || COPY.en

  return (
    <div style={{ marginTop: '40px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <Image
          src='/img/Checkout Secure.webp'
          alt={t.secureLabel}
          width={180}
          height={60}
          style={{ height: 'auto', maxHeight: '60px', width: 'auto' }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '32px',
        }}
      >
        {t.badges.map((b) => (
          <span
            key={b}
            style={{
              background: '#f0f9f4',
              color: '#1a8a4f',
              border: '1px solid #d0e8d8',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✓ {b}
          </span>
        ))}
      </div>

      <div
        style={{
          background: '#fff7d6',
          border: '1px solid #ebcb4c',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: '#0e2042',
            color: '#ebcb4c',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
            marginBottom: '10px',
          }}
        >
          {t.trialBadge}
        </span>
        <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: '#0e2042', fontSize: '16px' }}>{t.trialHeadline}</p>
        <p style={{ margin: 0, color: '#5a4500', fontSize: '14px', lineHeight: 1.5 }}>{t.trialBody}</p>
      </div>

      <div
        style={{
          background: '#f0f9f4',
          border: '1px solid #d0e8d8',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
        }}
      >
        <Image
          src='/img/satisfaction guarantee.webp'
          alt='100% Satisfaction Guarantee'
          width={96}
          height={96}
          style={{ flexShrink: 0, width: '88px', height: 'auto' }}
        />
        <div>
          <span
            style={{
              display: 'inline-block',
              background: '#1a8a4f',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              marginBottom: '10px',
            }}
          >
            {t.guaranteeBadge}
          </span>
          <p style={{ margin: '0 0 6px', fontWeight: 'bold', color: '#0e2042', fontSize: '16px' }}>
            {t.guaranteeHeadline}
          </p>
          <p style={{ margin: 0, color: '#2c5e3f', fontSize: '14px', lineHeight: 1.5 }}>{t.guaranteeBody}</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {t.benefits.map((b) => (
          <div
            key={b.title}
            style={{
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#1a8a4f',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              ✓
            </span>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#0e2042', fontSize: '14px' }}>{b.title}</p>
              <p style={{ margin: 0, color: '#555', fontSize: '13px', lineHeight: 1.5 }}>{b.body}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', margin: 0 }}>
        {t.supportLine}{' '}
        <a href={`mailto:${t.supportEmail}`} style={{ color: '#0e2042', fontWeight: 'bold' }}>
          {t.supportEmail}
        </a>
      </p>
    </div>
  )
}
