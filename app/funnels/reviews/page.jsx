import Link from 'next/link'
import ReviewsFunnelHeader from './components/ReviewsFunnelHeader'
import HeroSection from './components/HeroSection'
import TrustStrip from './components/TrustStrip'
import ProblemCards from './components/ProblemCards'
import SolutionGrid from './components/SolutionGrid'
import HowItWorksTimeline from './components/HowItWorksTimeline'
import TestimonialPlaceholder from './components/TestimonialPlaceholder'
import FAQSection from './components/FAQSection'

export default function ReviewsLandingPage() {
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
        <h2 style={{ fontSize: '36px', margin: '0 0 16px' }}>Getting reviews has never been easier</h2>
        <p style={{ fontSize: '18px', opacity: 0.85, marginBottom: '32px' }}>
          Texas AI Reviews does the hard work for you. Start your 14-day free trial.
        </p>
        <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href='/funnels/reviews/pricing'
            style={{
              background: '#ebcb4c',
              color: '#0e2042',
              padding: '14px 32px',
              fontWeight: 'bold',
              textDecoration: 'none',
              borderRadius: '6px',
            }}
          >
            Start 14-Day Free Trial
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
            Book a Demo
          </a>
        </div>
      </section>
    </main>
  )
}
