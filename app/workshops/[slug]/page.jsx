import Link from 'next/link'
import { notFound } from 'next/navigation'
import { workshops, getWorkshop, workshopCategories } from '../../../lib/workshops'
import WorkshopInquiry from '../../../src/components/workshops/WorkshopInquiry'
import styles from '../workshops.module.css'

export function generateStaticParams() {
  return workshops.map(({ slug }) => ({ slug }))
}

export function generateMetadata({ params }) {
  const workshop = getWorkshop(params.slug)
  if (!workshop) return { title: 'Workshop not found', robots: { index: false, follow: false } }
  return {
    title: workshop.title,
    description: workshop.summary,
    alternates: { canonical: `/workshops/${workshop.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${workshop.title} | Texas AI Consulting`,
      description: workshop.summary,
      url: `/workshops/${workshop.slug}`,
      type: 'website',
    },
    twitter: { card: 'summary', title: workshop.title, description: workshop.summary },
  }
}

export default function WorkshopPage({ params }) {
  const workshop = getWorkshop(params.slug)
  if (!workshop) notFound()
  const category = workshopCategories.find((item) => item.id === workshop.category)
  const related = workshops
    .filter((item) => item.category === workshop.category && item.slug !== workshop.slug)
    .slice(0, 3)
  const recommendations = related.length ? related : workshops.filter((item) => item.slug !== workshop.slug).slice(0, 2)
  let elapsed = 0
  return (
    <main className={styles.page} id='main-content'>
      <div className={styles.shell}>
        <nav aria-label='Breadcrumb' className={styles.breadcrumb}>
          <Link href='/'>Home</Link>
          <span aria-hidden='true'>/</span>
          <Link href='/workshops'>Workshops</Link>
          <span aria-hidden='true'>/</span>
          <span aria-current='page'>{workshop.title}</span>
        </nav>
        <div className={styles.detailGrid}>
          <header className={styles.detailHero}>
            <div>
              <Link className={styles.backLink} href='/workshops'>
                ← Back to AI workshops
              </Link>
              <p className={styles.kicker}>{category.label} · About 2 hours</p>
              <h1>{workshop.title}</h1>
              <p className={styles.lead}>{workshop.summary}</p>
            </div>
          </header>
          <div className={styles.detailContent}>
            <section className={styles.artifact}>
              <h2>Your practical result</h2>
              <p className={styles.artifactResult}>{workshop.artifact}</p>
              <p>
                The outline below is built around this result. Final tools and setup instructions will be confirmed with
                the session details before registration opens.
              </p>
            </section>
            <section>
              <h2>Who this is for</h2>
              <p>{workshop.audience}</p>
              <h3>What you’ll practice</h3>
              <ul className={styles.outcomes}>
                {workshop.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </section>
            <section id='outline'>
              <h2>Your two-hour workshop outline</h2>
              <p>
                A guided demonstration, a substantial build exercise, and time to check the result. Times are
                approximate and include discussion.
              </p>
              <ol className={styles.agenda}>
                {workshop.agenda.map((block) => {
                  const start = elapsed
                  elapsed += block.minutes
                  return (
                    <li key={block.title}>
                      <span className={styles.time}>
                        {start}–{elapsed} min
                      </span>
                      <div>
                        <h3>{block.title}</h3>
                        <p>{block.detail}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
            <section>
              <h2>Before you attend</h2>
              <ul className={styles.outcomes}>
                {workshop.prerequisites.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>Tools and access</h3>
              <p>{workshop.tools}</p>
              <p>
                Delivery platform, location or joining instructions will be published with each confirmed session. Use
                practice material you have permission to share.
              </p>
            </section>
            <section className={styles.instructor}>
              <div className={styles.initials} aria-hidden='true'>
                EL
              </div>
              <div>
                <h2>Your instructor</h2>
                <h3>Elliott Lamboy</h3>
                <p>
                  Elliott teaches these Texas AI Consulting workshops. The session is designed around a guided example,
                  your own practice, and a review of the work produced.
                </p>
              </div>
            </section>
            <section>
              <h2>Questions before you join</h2>
              {[
                ...workshop.faq,
                [
                  'When is the next session, and what does it cost?',
                  'Dates and fees are coming soon. The planned window is Friday, 11 a.m.–1 p.m. America/Chicago. Ask about availability below; an inquiry does not reserve a seat.',
                ],
                [
                  'What will be confirmed before I register?',
                  'The session date, fee, capacity, delivery platform, exact software requirements, and cancellation/refund terms will be available before registration opens. Recording or replay access is not currently promised.',
                ],
                [
                  'Can my team request a private workshop?',
                  'Yes. Choose “A private group workshop” in the inquiry form and describe your goal or group size. Elliott can discuss availability and fit.',
                ],
              ].map(([question, answer]) => (
                <details key={question} className={styles.faq}>
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            </section>
            <section className={styles.inquirySection} id='inquiry' aria-labelledby='inquiry-heading'>
              <h2 id='inquiry-heading'>Ask about this workshop</h2>
              <p>Interested in the next date or a session for your team? Tell Elliott what you’re looking for.</p>
              <WorkshopInquiry slug={workshop.slug} title={workshop.title} />
            </section>
            <section>
              <h2>Explore another workshop</h2>
              <ul className={styles.related}>
                {recommendations.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/workshops/${item.slug}`}>{item.title}</Link>
                    <p>{item.summary}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <aside className={styles.sidebar} aria-label='Session details and inquiry'>
            <div className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <p>{workshop.title}</p>
                <p className={styles.bookingStatus}>Dates coming soon</p>
                <p>Registration is not open yet</p>
              </div>
              <div className={styles.bookingBody}>
                <dl className={styles.sessionFacts}>
                  <div>
                    <dt>Duration</dt>
                    <dd>About 2 hours</dd>
                  </div>
                  <div>
                    <dt>Fee</dt>
                    <dd>To be announced</dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>Details coming soon</dd>
                  </div>
                  <div>
                    <dt>Planned window</dt>
                    <dd>Fridays, 11 a.m.–1 p.m.</dd>
                  </div>
                  <div>
                    <dt>Timezone</dt>
                    <dd>America/Chicago</dd>
                  </div>
                </dl>
                <a href='#inquiry' className={styles.button}>
                  Ask about this workshop
                </a>
                <p>
                  Send a short inquiry about the next public date or a private group. No seat is reserved and no payment
                  is collected.
                </p>
              </div>
            </div>
            <section className={styles.infoBox}>
              <h2>The workshop approach</h2>
              <div>
                <ul className={styles.sidebarList}>
                  <li>About two hours with Elliott Lamboy</li>
                  <li>A focused demonstration and exercise</li>
                  <li>Time to check the result</li>
                  <li>One practical take-home artifact</li>
                </ul>
                <a href='#outline'>Read the workshop outline</a>
              </div>
            </section>
            <section className={styles.infoBox}>
              <h2>Questions?</h2>
              <div>
                <p>Ask about setup requirements, team sessions or availability.</p>
                <a href='mailto:elliott@texasaiconsulting.com'>Email Elliott</a>
              </div>
            </section>
          </aside>
        </div>
        <footer className={styles.footer}>
          <Link href='/workshops'>All workshops</Link>
          <Link href='/privacy-policy'>Privacy</Link>
          <Link href='/terms-of-use'>Terms</Link>
        </footer>
      </div>
    </main>
  )
}
