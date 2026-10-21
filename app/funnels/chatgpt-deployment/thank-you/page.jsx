import { FunnelHeader, FunnelFooter } from '../components/FunnelChrome'
import BookingEmbed from '../components/BookingEmbed'

export const metadata = {
  title: 'Request Received',
  robots: { index: false, follow: false },
}

export default function ChatGPTDeploymentThankYouPage() {
  return (
    <main>
      <FunnelHeader showCta={false} />
      <section className='cgd-section'>
        <div className='cgd-container cgd-center' style={{ maxWidth: '900px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ebcb4c',
              color: '#0e2042',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            ✓
          </div>
          <h1>Thanks, your request is in.</h1>
          <p className='cgd-lead'>
            We&apos;ll reach out within one business day. Want to skip the back-and-forth? Pick a time below and
            we&apos;ll come prepared with questions about your workflows.
          </p>
        </div>
        <div className='cgd-container' style={{ maxWidth: '900px' }}>
          <div className='cgd-card' style={{ marginTop: '32px', padding: '8px' }}>
            <BookingEmbed />
          </div>
        </div>
      </section>
      <FunnelFooter />
    </main>
  )
}
