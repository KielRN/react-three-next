import Link from 'next/link'
import ReviewsFunnelHeader from '../reviews/components/ReviewsFunnelHeader'
import HeroSection from '../reviews/components/HeroSection'
import TrustStrip from '../reviews/components/TrustStrip'
import ProblemCards from '../reviews/components/ProblemCards'
import SolutionGrid from '../reviews/components/SolutionGrid'
import HowItWorksTimeline from '../reviews/components/HowItWorksTimeline'
import FAQSection from '../reviews/components/FAQSection'

export default function ReviewsTestLiveLanding() {
  return (
    <main>
      <ReviewsFunnelHeader currentStep={1} />
      <div
        style={{
          background: '#fff7d6',
          color: '#7a5b00',
          padding: '12px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Internal smoke-test funnel. Use only for verifying LIVE Stripe wiring.
      </div>
      <HeroSection />
      <TrustStrip />
      <ProblemCards />
      <SolutionGrid />
      <HowItWorksTimeline />
      <FAQSection />
      <section style={{ padding: '60px 24px', background: '#0e2042', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', margin: '0 0 16px' }}>Run TEST-LIVE checkout</h2>
        <Link
          href='/funnels/reviews-test-live/pricing'
          style={{
            background: '#ebcb4c',
            color: '#0e2042',
            padding: '14px 32px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '6px',
          }}
        >
          Go to Test-Live Pricing
        </Link>
      </section>
    </main>
  )
}
