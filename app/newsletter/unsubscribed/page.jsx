import Link from 'next/link'

export const metadata = {
  title: 'Unsubscribed | Texas AI Weekly',
  description: 'You are unsubscribed from Texas AI Weekly.',
  robots: { index: false, follow: true },
}

// Landing page for the newsletter's one-click unsubscribe link. The click itself is a GHL
// trigger link; GHL's unsubscribe workflow tags the contact and turns on do-not-disturb.
export default function NewsletterUnsubscribedPage() {
  return (
    <div className='min-h-screen w-full bg-gradient-to-b from-black to-gray-900 text-white'>
      <main className='mx-auto max-w-2xl px-4 py-16'>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-ai-gold'>Texas AI Weekly</p>
        <h1 className='mb-4 text-3xl font-bold md:text-4xl'>You&apos;re unsubscribed</h1>
        <p className='mb-4 text-lg text-gray-200'>
          You won&apos;t get Texas AI Weekly anymore. Thanks for reading while you did.
        </p>
        <p className='mb-8 text-gray-300'>
          Still getting emails after a few days, or clicked by mistake? Email{' '}
          <a className='text-ai-gold underline' href='mailto:elliott@texasaiconsulting.com'>
            elliott@texasaiconsulting.com
          </a>{' '}
          and Elliott will sort it out.
        </p>
        <Link href='/' className='text-ai-gold underline'>
          ← Back to texasaiconsulting.com
        </Link>
      </main>
    </div>
  )
}
