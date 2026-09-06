import Link from 'next/link'
import ReviewsFunnelHeader from './components/ReviewsFunnelHeader'
import HeroSection from './components/HeroSection'
import TrustStrip from './components/TrustStrip'
import ProblemCards from './components/ProblemCards'
import SolutionGrid from './components/SolutionGrid'
import HowItWorksTimeline from './components/HowItWorksTimeline'
import TestimonialPlaceholder from './components/TestimonialPlaceholder'
import FAQSection from './components/FAQSection'

export default function ReviewsEsLandingPage() {
  return (
    <main>
      <ReviewsFunnelHeader currentStep={1} />
      <HeroSection />
      <TrustStrip />
      <ProblemCards />
      <SolutionGrid />
      <HowItWorksTimeline />
      <TestimonialPlaceholder />
      <FAQSection />

      <section style={{ padding: '80px 24px', background: '#0e2042', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', margin: '0 0 16px' }}>Conseguir reseñas nunca había sido tan fácil</h2>
        <p style={{ fontSize: '18px', opacity: 0.85, marginBottom: '32px' }}>
          Texas AI Reseñas hace el trabajo pesado por ti. Empieza tu prueba gratis de 14 días.
        </p>
        <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href='/funnels/reviews-es/precios'
            style={{
              background: '#ebcb4c',
              color: '#0e2042',
              padding: '14px 32px',
              fontWeight: 'bold',
              textDecoration: 'none',
              borderRadius: '6px',
            }}
          >
            Empieza Tu Prueba Gratis de 14 Días
          </Link>
          <a
            href='https://link.texasaiconsulting.com/widget/booking/uuJHOQrN5564Px31JrBi'
            target='_blank'
            rel='noreferrer'
            style={{
              background: 'transparent',
              color: '#ebcb4c',
              border: '2px solid #ebcb4c',
              padding: '12px 32px',
              fontWeight: 'bold',
              textDecoration: 'none',
              borderRadius: '6px',
            }}
          >
            Agenda una Demo
          </a>
        </div>
      </section>
    </main>
  )
}
