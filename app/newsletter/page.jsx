import NewsletterSignup from '@/components/newsletter/NewsletterSignup'

export const metadata = {
  title: 'Texas AI Weekly | Free Thursday Newsletter',
  description:
    'Texas AI Weekly: a free 5-minute Thursday email from Elliott Lamboy on what AI is doing in Texas and what it means for your business. Subscribe and get the Texas AI Quick-Start guide.',
  alternates: { canonical: '/newsletter' },
  openGraph: {
    title: 'Texas AI Weekly',
    description: 'A free 5-minute Thursday read on Texas + AI for business owners.',
    url: 'https://texasaiconsulting.com/newsletter',
    type: 'website',
  },
}

const SECTIONS = [
  ['The big one', 'One story that matters this week, in plain English, ending with what a business owner should actually do.'],
  ['Texas + AI this week', 'Three to five quick hits from around the state, each with a source link and my honest take.'],
  ['Healthcare corner', 'One item on ChatGPT in clinics and hospitals, for the doctors and practice leaders on the list.'],
  ['Try this', 'One practical AI move you can use that same week.'],
  ['Workshop spotlight', 'The next live Texas AI Consulting workshop, with date, time and price.'],
  ['Reader question', 'A question back to you. Hit reply and I read it.'],
]

export default function NewsletterPage() {
  return (
    <div className='min-h-screen w-full bg-gradient-to-b from-black via-[#0a1630] to-gray-900 text-white'>
      <main className='mx-auto max-w-4xl px-4 py-12 md:py-16'>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-ai-gold'>Every Thursday, 7 a.m. Central</p>
        <h1 className='mb-4 text-4xl font-bold leading-tight md:text-5xl'>
          Texas AI <span className='text-ai-gold'>Weekly</span>
        </h1>
        <p className='mb-8 max-w-2xl text-lg leading-relaxed text-gray-200'>
          A 5-minute read on what AI is doing in Texas and what it means for your business. Written like a smart friend
          would tell it: no hype, no news-wire mush, an opinion on every item.
        </p>

        <NewsletterSignup source='newsletter' readSrcParam id='newsletter-top' heading='Join free' />

        <section className='mt-12 grid gap-8 md:grid-cols-2'>
          <div>
            <h2 className='mb-4 text-2xl font-bold text-ai-gold'>What a Thursday issue looks like</h2>
            <ol className='space-y-3'>
              {SECTIONS.map(([title, text]) => (
                <li key={title} className='rounded-md border border-ai-blue/30 bg-black/30 p-4'>
                  <p className='font-semibold text-white'>{title}</p>
                  <p className='text-sm text-gray-300'>{text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className='space-y-8'>
            <div className='rounded-lg border border-ai-gold/40 bg-ai-navy/80 p-6'>
              <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-ai-gold'>Free when you join</p>
              <h2 className='mb-2 text-2xl font-bold'>Texas AI Quick-Start guide</h2>
              <p className='text-gray-200'>
                A short PDF on where AI saves a Texas business real time first, how to roll it out without a mess, and what
                to watch for with customer and patient data. It arrives with your welcome email.
              </p>
            </div>
            <div className='rounded-lg border border-ai-blue/30 bg-black/30 p-6'>
              <h2 className='mb-2 text-2xl font-bold text-ai-gold'>Who writes it</h2>
              <p className='text-gray-200'>
                Elliott Lamboy, founder of Texas AI Consulting: 22-year Air Force veteran, 20+ year RN, MBA and
                IBM-certified AI Engineer. Texas AI Consulting is a member of the OpenAI Partner Network.
              </p>
            </div>
            <p className='text-sm text-gray-400'>
              One email a week. Every issue has a one-click unsubscribe link. Texas AI Consulting, 1248 FM 78 Ste 102 PMB
              2006, Schertz, TX 78154.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
