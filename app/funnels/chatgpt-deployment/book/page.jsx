import Link from 'next/link'
import { FunnelHeader, FunnelFooter } from '../components/FunnelChrome'
import BookingEmbed from '../components/BookingEmbed'

export const metadata = {
  title: 'Book a ChatGPT Rollout Call',
}

export default function ChatGPTDeploymentBookPage() {
  return (
    <main>
      <FunnelHeader showCta={false} />
      <section className='cgd-section'>
        <div className='cgd-container' style={{ maxWidth: '900px' }}>
          <span className='cgd-eyebrow'>BOOK A CALL</span>
          <h1>Pick a time that works</h1>
          <p className='cgd-lead'>
            We&apos;ll talk through where your team&apos;s time goes and find the first workflow worth handing to
            ChatGPT. Prefer to send details first?{' '}
            <Link href='/funnels/chatgpt-deployment#request' style={{ color: '#0e2042', fontWeight: 'bold' }}>
              Use the request form
            </Link>
            .
          </p>
          <div className='cgd-card' style={{ marginTop: '32px', padding: '8px' }}>
            <BookingEmbed />
          </div>
        </div>
      </section>
      <FunnelFooter />
    </main>
  )
}
