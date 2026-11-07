import Link from 'next/link'

// Registration facts verified against SAM.gov and the Texas Comptroller (Nov 6, 2026).
// SAM.gov registration renews every year (next: Oct 23, 2027). Update this page when it does.
const CAPABILITY_STATEMENT = '/docs/Texas-AI-Consulting-Capability-Statement.pdf'

const description =
  'Government contracting data for Texas AI Consulting, LLC: SAM.gov UEI LE9JXUK4C3P3, CAGE code 26UG0, Texas VetHUB certification, NIGP codes and capability statement.'

export const metadata = {
  title: 'Government Contracting',
  description,
  alternates: {
    canonical: 'https://texasaiconsulting.com/government',
  },
  openGraph: {
    title: 'Government Contracting | Texas AI Consulting',
    description,
    url: 'https://texasaiconsulting.com/government',
    type: 'website',
  },
}

const federal = [
  { label: 'Legal name', value: 'TEXAS AI CONSULTING, LLC' },
  { label: 'Unique Entity ID (UEI)', value: 'LE9JXUK4C3P3', mono: true },
  { label: 'CAGE code', value: '26UG0', mono: true },
  { label: 'SAM.gov status', value: 'Active, All Awards' },
]

const texas = [
  { label: 'Texas Vendor ID (VID)', value: '1414106200100', mono: true },
  { label: 'Certification', value: 'VetHUB certified, Texas Comptroller of Public Accounts' },
  { label: 'Bidders list', value: 'Registered on the Centralized Master Bidders List (CMBL)' },
  { label: 'Business type', value: 'Veteran-owned small business, Texas LLC' },
]

const competencies = [
  ['AI strategy and implementation', 'Roadmaps, workflow automation, custom models and NLP'],
  ['ChatGPT and generative AI deployment', 'Use-case discovery, rollout, prompt engineering and staff training'],
  ['AI governance', 'Texas TRAIGA (HB 149) readiness, transparency and bias review'],
  ['Software, cloud and data', 'Full-stack web apps, APIs, Google Cloud, Docker, ETL pipelines and Power BI'],
  ['Healthcare IT', 'Epic, Cerner and Meditech workflows; HIPAA-compliant system design'],
  ['Training and workshops', 'AI productivity training for agency and business teams'],
]

const nigp = [
  {
    group: '918 · Consulting Services',
    codes: [
      ['918-21', 'Business Consulting'],
      ['918-29', 'Computer Software Consulting'],
      ['918-32', 'Consulting Services (Not Otherwise Classified)'],
      ['918-38', 'Education and Training Consulting'],
      ['918-71', 'IT Consulting (Not Otherwise Classified)'],
      ['918-78', 'Medical Consulting'],
    ],
  },
  {
    group: '920 · Data Processing, Software and AI Services',
    codes: [
      ['920-24', 'Data Conversion Services'],
      ['920-30', 'Image Processing and Conversion Services'],
      ['920-40', 'Programming Services, Including Mobile Applications'],
      ['920-45', 'Software Maintenance, Support and Data Hosting'],
      ['920-91', 'Training, Computer Based, Software Supported'],
    ],
  },
  {
    group: '915 · Communications and Media Services',
    codes: [
      ['915-82', 'Video Production Services'],
      ['915-96', 'Web Page Design, Management and Maintenance'],
    ],
  },
]

function DataCard({ title, rows }) {
  return (
    <section className='rounded-2xl bg-white p-6 shadow-xl md:p-8'>
      <h2 className='mb-4 text-xl font-bold text-ai-navy'>{title}</h2>
      <dl className='divide-y divide-gray-100'>
        {rows.map(({ label, value, mono }) => (
          <div key={label} className='flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4'>
            <dt className='text-sm text-gray-500'>{label}</dt>
            <dd
              className={`font-semibold text-gray-900 sm:text-right ${
                mono ? 'select-all font-mono text-lg tracking-wider slashed-zero' : ''
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function GovernmentPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50'>
      <header className='bg-ai-navy py-12 text-white'>
        <div className='container mx-auto max-w-5xl px-4'>
          <p className='mb-2 text-xs uppercase tracking-widest text-ai-gold'>Texas AI Consulting</p>
          <h1 className='text-3xl font-bold md:text-4xl'>Government Contracting</h1>
          <p className='mt-3 max-w-2xl text-gray-300'>
            Registration and certification details for contracting officers, procurement teams and prime contractors.
          </p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <a
              href={CAPABILITY_STATEMENT}
              download
              className='rounded-lg bg-ai-gold px-5 py-3 font-semibold text-ai-navy transition-colors hover:bg-white'
            >
              Download capability statement (PDF)
            </a>
            <a
              href='mailto:elliott@texasaiconsulting.com?subject=Government%20contracting%20inquiry'
              className='rounded-lg border border-white/40 px-5 py-3 font-semibold text-white transition-colors hover:border-ai-gold hover:text-ai-gold'
            >
              Contact our contracting lead
            </a>
          </div>
        </div>
      </header>

      <main className='container mx-auto max-w-5xl px-4 py-10'>
        <div className='grid gap-6 md:grid-cols-2'>
          <DataCard title='Federal registration' rows={federal} />
          <DataCard title='State of Texas' rows={texas} />
        </div>

        <section className='mt-6 rounded-2xl bg-white p-6 shadow-xl md:p-8'>
          <h2 className='mb-2 text-xl font-bold text-ai-navy'>Who we are</h2>
          <p className='leading-relaxed text-gray-800'>
            Texas AI Consulting helps Texas agencies, healthcare systems and businesses put AI to work safely. The firm is
            led by Eliud &ldquo;Elliott&rdquo; Lamboy, a 22-year U.S. Air Force veteran and Registered Nurse with 20+
            years of health IT experience. We pair clinical practice with IBM-certified AI engineering to modernize
            legacy workflows and keep patient and public data secure. Texas AI Consulting is a member of the OpenAI
            Partner Network.
          </p>
          <p className='mt-3 leading-relaxed text-gray-800'>
            <strong>Prime contractors:</strong> as a Texas VetHUB-certified small business, we team as a subcontractor
            to help you meet VetHUB subcontracting goals on state work.
          </p>
        </section>

        <section className='mt-6 rounded-2xl bg-white p-6 shadow-xl md:p-8'>
          <h2 className='mb-4 text-xl font-bold text-ai-navy'>Core competencies</h2>
          <ul className='grid gap-4 md:grid-cols-2'>
            {competencies.map(([name, detail]) => (
              <li key={name} className='border-l-4 border-ai-gold pl-4'>
                <p className='font-semibold text-gray-900'>{name}</p>
                <p className='text-sm text-gray-600'>{detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className='mt-6 rounded-2xl bg-white p-6 shadow-xl md:p-8'>
          <h2 className='mb-1 text-xl font-bold text-ai-navy'>NIGP commodity codes</h2>
          <p className='mb-4 text-sm text-gray-500'>Selected codes from our Texas CMBL registration.</p>
          <div className='grid gap-6 md:grid-cols-3'>
            {nigp.map(({ group, codes }) => (
              <div key={group}>
                <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-ai-navy'>{group}</h3>
                <ul className='space-y-1 text-sm text-gray-800'>
                  {codes.map(([code, name]) => (
                    <li key={code}>
                      <span className='font-mono font-semibold'>{code}</span> {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className='mt-6 rounded-2xl bg-ai-navy p-6 text-white shadow-xl md:p-8'>
          <h2 className='mb-3 text-xl font-bold text-ai-gold'>Point of contact</h2>
          <p className='font-semibold'>Eliud &ldquo;Elliott&rdquo; Lamboy, CEO</p>
          <p className='mt-1'>
            <a className='underline hover:text-ai-gold' href='mailto:elliott@texasaiconsulting.com'>
              elliott@texasaiconsulting.com
            </a>{' '}
            ·{' '}
            <a className='underline hover:text-ai-gold' href='tel:+12105507258'>
              210-550-7258
            </a>
          </p>
          <p className='mt-1 text-sm text-gray-300'>Mailing: 1248 FM 78 Ste 102 PMB 2006, Schertz, TX 78154</p>
        </section>

        <div className='mt-8 text-center'>
          <Link href='/' className='text-ai-blue underline transition-colors hover:text-ai-gold'>
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
