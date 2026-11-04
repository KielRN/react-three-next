import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWorkshop, getWorkshopSession, formatWorkshopDate, workshopPolicy } from '../../../../lib/workshops'
import { isRegistrationOpen } from '../../../../lib/workshop-registration'
import WorkshopCheckout from '../../../../src/components/workshops/WorkshopCheckout'
import styles from '../../workshops.module.css'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }) {
  const workshop = getWorkshop(params.slug)
  return {
    title: workshop ? `Register: ${workshop.title}` : 'Workshop not found',
    robots: { index: false, follow: false },
  }
}

export default function WorkshopRegisterPage({ params }) {
  const workshop = getWorkshop(params.slug)
  if (!workshop) notFound()
  const session = getWorkshopSession(workshop.slug)
  const open = isRegistrationOpen(workshop.slug)
  return (
    <main className={styles.page} id='main-content'>
      <div className={styles.shell}>
        <nav aria-label='Breadcrumb' className={styles.breadcrumb}>
          <Link href='/workshops'>Workshops</Link>
          <span aria-hidden='true'>/</span>
          <Link href={`/workshops/${workshop.slug}`}>{workshop.title}</Link>
          <span aria-hidden='true'>/</span>
          <span aria-current='page'>Register</span>
        </nav>
        <section className={styles.inquirySection} aria-labelledby='register-heading'>
          <h1 id='register-heading'>Register: {workshop.title}</h1>
          {open ? (
            <>
              <p>
                {formatWorkshopDate(session)}, 11 a.m.–1 p.m. America/Chicago, live on Google Meet. ${workshop.priceUSD}{' '}
                USD. Your confirmation email has the Meet link.
              </p>
              <WorkshopCheckout
                slug={workshop.slug}
                title={workshop.title}
                policy={`${workshopPolicy.cancellation} ${workshopPolicy.organizer}`}
              />
            </>
          ) : (
            <p>
              Registration is not open for this workshop.{' '}
              <Link href={`/workshops/${workshop.slug}#inquiry`}>Ask about the next date</Link>.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
