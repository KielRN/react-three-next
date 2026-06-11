import '../growth-platform/funnel.css'

export const metadata = {
  title: 'Texas AI Reseñas — Automatización de Reseñas para Negocios de Servicio',
  description:
    'Consigue más reseñas en Google en piloto automático. Texas AI Reseñas envía las solicitudes, los recordatorios y responde por ti para que tu negocio salga primero y cierre más trabajos.',
}

export default function ReviewsEsLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {children}
    </div>
  )
}
