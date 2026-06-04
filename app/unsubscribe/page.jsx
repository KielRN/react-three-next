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
      <header className='bg-ai-navy py-10 text-white'>
        <div className='container mx-auto max-w-3xl px-4'>
          <p className='mb-2 text-xs uppercase tracking-widest text-ai-gold'>Texas AI Consulting</p>
          <h1 className='text-3xl font-bold md:text-4xl'>Unsubscribe</h1>
          <p className='mt-2 text-sm text-gray-300'>
            Remove yourself from our email and SMS communications.
          </p>
        </div>
      </header>

      <main className='container mx-auto max-w-3xl px-4 py-10'>
        <article className='rounded-2xl bg-white p-6 leading-relaxed text-gray-800 shadow-xl md:p-10'>
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

          <p className='mt-8 text-sm text-gray-500'>
            Having trouble? Email us at{' '}
            <a className='text-ai-blue underline' href='mailto:contact@texasaiconsulting.com'>
              contact@texasaiconsulting.com
            </a>{' '}
            or call{' '}
            <a className='text-ai-blue underline' href='tel:+12109722543'>
              +1 210-972-2543
            </a>
            .
          </p>
        </article>

        <div className='mt-8 text-center'>
          <Link href='/' className='text-ai-blue underline transition-colors hover:text-ai-gold'>
            ← Back to Home
          </Link>
        </div>
      </main>

      <Script src='https://link.texasaiconsulting.com/js/form_embed.js' strategy='afterInteractive' />
    </div>
  )
}
