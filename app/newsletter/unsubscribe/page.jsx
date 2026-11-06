import Link from 'next/link'
import UnsubscribeConfirm from '@/components/newsletter/UnsubscribeConfirm'

export const metadata = {
  title: 'Unsubscribe | Texas AI Weekly',
  description: 'Unsubscribe from Texas AI Weekly.',
  robots: { index: false, follow: true },
}

// Every unsubscribe link in Texas AI Weekly emails lands here. Nothing changes until the reader
// clicks the button, so link-scanning mail filters can't unsubscribe anyone.
export default function NewsletterUnsubscribePage({ searchParams }) {
  const contactId = typeof searchParams?.c === 'string' && /^[A-Za-z0-9]{10,40}$/.test(searchParams.c) ? searchParams.c : ''
  return (
    <div className='min-h-screen w-full bg-gradient-to-b from-black to-gray-900 text-white'>
      <main className='mx-auto max-w-2xl px-4 py-16'>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-ai-gold'>Texas AI Weekly</p>
        <h1 className='mb-4 text-3xl font-bold md:text-4xl'>Unsubscribe from Texas AI Weekly?</h1>
        <p className='mb-8 text-lg text-gray-200'>
          {contactId
            ? 'Click the button and you won’t get Texas AI Weekly anymore.'
            : 'Enter the email address you get Texas AI Weekly at, then click the button.'}
        </p>
        <UnsubscribeConfirm contactId={contactId} />
        <p className='mt-10 text-gray-300'>
          Changed your mind? Just close this page.{' '}
          <Link href='/' className='text-ai-gold underline'>
            Back to texasaiconsulting.com
          </Link>
        </p>
      </main>
    </div>
  )
}
