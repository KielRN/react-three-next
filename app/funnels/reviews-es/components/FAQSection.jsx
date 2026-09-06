'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: '¿Cuánto dura la prueba gratis?',
    a: '14 días. Pones tu información de pago al registrarte pero no te cobramos nada hasta el día 15. Cancela cuando quieras antes de esa fecha y no pagas nada.',
  },
  {
    q: '¿Y si necesito más de 300 solicitudes de reseñas al mes?',
    a: 'Háblanos — armamos un plan a tu medida por encima del nivel Pro. Agenda una demo y lo definimos juntos.',
  },
  {
    q: '¿Tengo que usar un CRM específico?',
    a: 'No. Nos integramos con la mayoría de los CRMs principales. También aceptamos datos de clientes por Zapier, subida de CSV o integración personalizada.',
  },
  {
    q: '¿Cuánto tarda la configuración?',
    a: 'La mayoría de clientes están funcionando en 48 horas. La configuración incluye una llamada 1-a-1 donde armamos tu automatización de reseñas, integramos tu CRM y preparamos tu campaña de reactivación.',
  },
  {
    q: '¿Los clientes se van a dar cuenta de que las reseñas son automatizadas?',
    a: 'Las solicitudes salen de tu parte y se ven como si tú las hubieras mandado. Los clientes responden a la solicitud igual que a cualquier otro mensaje.',
  },
  {
    q: '¿Qué plataformas de reseñas soportan?',
    a: 'Google es el objetivo principal porque es la que más impacta en las búsquedas locales. También podemos enviar solicitudes a Facebook, Yelp y plataformas específicas de tu industria.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. No hay contrato a largo plazo. Los planes mensuales se cancelan al final del ciclo actual. Los planes anuales al final del año.',
  },
  {
    q: '¿Hay costo de configuración?',
    a: 'No. El precio que ves es el precio que pagas. Sin cuotas escondidas de configuración ni de onboarding.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '36px', color: '#0e2042', textAlign: 'center', marginBottom: '48px' }}>
        Preguntas Frecuentes
      </h2>
      <div>
        {FAQS.map((item, i) => (
          <div
            key={item.q}
            style={{
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <button
              type='button'
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                padding: '8px 0',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#0e2042',
              }}
            >
              <span>{item.q}</span>
              <span style={{ fontSize: '20px', color: '#ebcb4c' }}>{openIndex === i ? '−' : '+'}</span>
            </button>
            {openIndex === i && <p style={{ marginTop: '12px', color: '#555', lineHeight: 1.6 }}>{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
