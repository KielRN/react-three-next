import Link from 'next/link'
import WorkshopCatalog from '../../src/components/workshops/WorkshopCatalog'
import styles from './workshops.module.css'

export const metadata = {
  title: 'Practical AI Workshops for Business, Careers & Engineering',
  description:
    'Explore nine hands-on AI workshops with Texas AI Consulting. Build a focused result in about two hours. Browse outlines and ask about the next session.',
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
    description: 'Nine focused workshop topics. Explore the outlines and ask about availability.',
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
              <strong>How to get started:</strong> choose a workshop, explore the outline, and ask about the next public
              date or a private session. Dates, fees and delivery details will be confirmed before registration opens.
            </div>
            <WorkshopCatalog />
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
                <h3>Dates coming soon</h3>
                <p>
                  These workshops are in planning. Dates, fees, seat limits and delivery details are being finalized.
                </p>
                <p>No seats are on sale yet. An inquiry does not reserve a place.</p>
              </div>
            </section>
            <section className={styles.infoBox}>
              <h2>How to inquire</h2>
              <div>
                <ol className={styles.steps}>
                  <li>
                    Choose <strong>View Workshop</strong> for the topic that fits your goal.
                  </li>
                  <li>Read the outline and preparation requirements.</li>
                  <li>Send an inquiry for a public session or a private group.</li>
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
