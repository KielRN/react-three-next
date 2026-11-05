import HomePage from '@/components/dom/HomePage'
import NewsletterSignup from '@/components/newsletter/NewsletterSignup'

export const metadata = {
  alternates: { canonical: '/' },
}

export default function Page() {
  return (
    <>
      <HomePage />
      <section className='w-full bg-gray-900 px-4 py-10'>
        <div className='mx-auto max-w-4xl'>
          <NewsletterSignup source='home' id='newsletter-home' />
        </div>
      </section>
    </>
  )
}
