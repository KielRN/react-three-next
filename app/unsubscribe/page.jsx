import Link from 'next/link'
import Script from 'next/script'

export const metadata = {
  title: 'Unsubscribe',
  description:
    'Unsubscribe from Texas AI Consulting communications. Use this form to remove yourself from our email and SMS lists.',
  alternates: {
    canonical: 'https://texasaiconsulting.com/unsubscribe',
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Unsubscribe | Texas AI Consulting',
    description: 'Unsubscribe from Texas AI Consulting communications.',
    url: 'https://texasaiconsulting.com/unsubscribe',
    type: 'website',
  },
}

export default function UnsubscribePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50'>
      <header className='bg-[#0e2042] text-white py-10'>
        <div className='container mx-auto px-4 max-w-3xl'>
          <p className='text-xs tracking-widest uppercase text-[#ebcb4c] mb-2'>Texas AI Consulting</p>
          <h1 className='text-3xl md:text-4xl font-bold'>Unsubscribe</h1>
          <p className='text-gray-300 mt-2 text-sm'>
            Remove yourself from our email and SMS communications.
          </p>
        </div>
      </header>

      <main className='container mx-auto px-4 py-10 max-w-3xl'>
        <article className='bg-white rounded-2xl shadow-xl p-6 md:p-10 text-gray-800 leading-relaxed'>
          <p className='mb-6'>
            We&rsquo;re sorry to see you go. Submit the form below and we&rsquo;ll process your request immediately. You
            can also reply <strong>&ldquo;STOP&rdquo;</strong> to any SMS message to opt out of text communications.
          </p>

          <div className='w-full' style={{ minHeight: '739px' }}>
            <iframe
              src='https://link.texasaiconsulting.com/widget/form/EYoKQV0jzJZGZHkFNqaN'
              style={{ width: '100%', height: '739px', border: 'none', borderRadius: '8px' }}
              id='inline-EYoKQV0jzJZGZHkFNqaN'
              data-layout="{'id':'INLINE'}"
              data-trigger-type='alwaysShow'
              data-trigger-value=''
              data-activation-type='alwaysActivated'
              data-activation-value=''
              data-deactivation-type='neverDeactivate'
              data-deactivation-value=''
              data-form-name='Unsubscribe'
              data-height='739'
              data-layout-iframe-id='inline-EYoKQV0jzJZGZHkFNqaN'
              data-form-id='EYoKQV0jzJZGZHkFNqaN'
              title='Unsubscribe'
            />
          </div>

          <p className='text-sm text-gray-500 mt-8'>
            Having trouble? Email us at{' '}
            <a className='text-[#2c75ff] underline' href='mailto:contact@texasaiconsulting.com'>
              contact@texasaiconsulting.com
            </a>{' '}
            or call{' '}
            <a className='text-[#2c75ff] underline' href='tel:+12109722543'>
              +1 210-972-2543
            </a>
            .
          </p>
        </article>

        <div className='mt-8 text-center'>
          <Link href='/' className='text-[#2c75ff] hover:text-[#ebcb4c] underline transition-colors'>
            ← Back to Home
          </Link>
        </div>
      </main>

      <Script src='https://link.texasaiconsulting.com/js/form_embed.js' strategy='afterInteractive' />
    </div>
  )
}
