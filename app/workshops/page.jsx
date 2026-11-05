import Link from 'next/link'
import WorkshopCatalog from '../../src/components/workshops/WorkshopCatalog'
import { workshopPolicy } from '../../lib/workshops'
import styles from './workshops.module.css'

export const revalidate = 300

export const metadata = {
  title: 'Practical AI Workshops for Business, Careers & Engineering',
  description:
    'Explore nine hands-on AI workshops with Texas AI Consulting. Build a focused result in about two hours. Browse dates, outlines and registration details.',
  alternates: { canonical: '/workshops' },
  openGraph: {
    title: 'Practical AI Workshops | Texas AI Consulting',
    description: 'Find a focused AI workshop for your work. Business, careers, engineering and data.',
    url: '/workshops',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Practical AI Workshops | Texas AI Consulting',
    description: 'Nine focused workshop topics. Explore dates, outlines and registration details.',
  },
  robots: { index: true, follow: true },
}

export default function WorkshopsPage() {
  return (
    <main className={styles.page} id='main-content'>
      <div className={styles.shell}>
        <nav aria-label='Breadcrumb' className={styles.breadcrumb}>
          <Link href='/'>Home</Link>
          <span aria-hidden='true'>›</span>
          <span aria-current='page'>AI Workshops</span>
        </nav>
        <div className={styles.catalogLayout}>
          <div>
            <header className={styles.hero}>
              <h1>Practical AI workshops — find your starting point</h1>
              <p className={styles.lead}>
                Focused, hands-on learning for business owners, career changers and technical teams.
              </p>
              <p className={styles.sublead}>
                About two hours. One useful result. Taught by Elliott Lamboy of Texas AI Consulting.
              </p>
            </header>
            <div className={styles.notice}>
              <strong>How to get started:</strong> choose a workshop, explore the outline, and use Register on the
              workshop page to reserve a place in an available public session. For a private group, send an inquiry.
              Sessions are online via Google Meet.
            </div>
            <WorkshopCatalog asOf={Date.now()} />
            <section className={styles.policySection} id='workshop-policy' aria-labelledby='workshop-policy-title'>
              <h2 id='workshop-policy-title'>Workshop cancellation and refund policy</h2>
              <p>{workshopPolicy.cancellation}</p>
              <p>{workshopPolicy.organizer}</p>
              <p>
                To cancel, transfer your place or ask about a refund, email{' '}
                <a href='mailto:elliott@texasaiconsulting.com'>elliott@texasaiconsulting.com</a>.
              </p>
            </section>
            <section className={styles.teamSection}>
              <h2>Have a team or a particular workflow in mind?</h2>
              <p>
                Choose the closest workshop and tell Elliott what your group wants to accomplish. We can discuss the
                right starting point and session availability.
              </p>
              <a href='mailto:elliott@texasaiconsulting.com'>elliott@texasaiconsulting.com</a>
            </section>
          </div>
          <aside className={styles.catalogSidebar} aria-label='Workshop information'>
            <section className={styles.infoBox}>
              <h2>Training status</h2>
              <div>
                <h3>Registration and availability</h3>
                <p>
                  Each workshop lists its next scheduled date. Sessions run Fridays, 11 a.m.–1 p.m. Central, online
                  via Google Meet.
                </p>
                <p>
                  Business/career sessions: up to 12 attendees. Technical sessions: up to 10. Registration availability
                  is shown on each workshop page. Completing payment reserves your place; an inquiry does not.
                </p>
              </div>
            </section>
            <section className={styles.infoBox}>
              <h2>How to register</h2>
              <div>
                <ol className={styles.steps}>
                  <li>
                    Choose <strong>View Workshop</strong> for the topic that fits your goal.
                  </li>
                  <li>Read the outline and preparation requirements.</li>
                  <li>Choose Register for an available public session, or send an inquiry for a private group.</li>
                </ol>
              </div>
            </section>
            <section className={styles.infoBox}>
              <h2>A session for your team</h2>
              <div>
                <p>Have a business goal, a group or a preferred date? Ask about a focused workshop.</p>
                <a href='mailto:elliott@texasaiconsulting.com'>Email Elliott</a>
              </div>
            </section>
            <section className={`${styles.infoBox} ${styles.yellowBox}`}>
              <h2>Built around a practical result</h2>
              <div>
                <p>
                  Each outline has a guided example, time to build, and a review step. Explore the result and
                  prerequisites before choosing a session.
                </p>
              </div>
            </section>
          </aside>
        </div>
        <footer className={styles.footer}>
          <Link href='/'>Texas AI Consulting</Link>
          <Link href='/privacy-policy'>Privacy</Link>
          <Link href='/terms-of-use'>Terms</Link>
        </footer>
      </div>
    </main>
  )
}
