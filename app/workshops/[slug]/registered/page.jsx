import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWorkshop, getWorkshopSession, formatWorkshopDate } from '../../../../lib/workshops'
import { REGISTRATION_SOURCE } from '../../../../lib/workshop-registration'
import { getStripeWorkshops } from '../../../../lib/stripe-workshops'
import styles from '../../workshops.module.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Workshop registration', robots: { index: false, follow: false } }

// Shows what Stripe says about this checkout; the GHL write happens in the webhook.
async function readCheckout(sessionId, slug) {
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId || '')) return null
  try {
    const checkout = await getStripeWorkshops().checkout.sessions.retrieve(sessionId)
    const meta = checkout.metadata || {}
    return meta.source === REGISTRATION_SOURCE && meta.workshop === slug ? checkout : null
  } catch {
    return null
  }
}

export default async function WorkshopRegisteredPage({ params, searchParams }) {
  const workshop = getWorkshop(params.slug)
  if (!workshop) notFound()
  const session = getWorkshopSession(workshop.slug)
  const checkout = await readCheckout(searchParams.session_id, workshop.slug)
  const paid = checkout?.payment_status === 'paid'
  return (
    <main className={styles.page} id='main-content'>
      <div className={styles.shell}>
        <section className={styles.inquirySection} aria-labelledby='registered-heading'>
          {paid ? (
            <div className={styles.success} role='status'>
              <h1 id='registered-heading'>You’re registered</h1>
              <p>
                Thank you{checkout.customer_details?.name ? `, ${checkout.customer_details.name.split(' ')[0]}` : ''}. Your
                seat in {workshop.title} is reserved
                {session ? ` for ${formatWorkshopDate(session)}, 11 a.m.–1 p.m. America/Chicago` : ''}.
              </p>
              <p>
                A confirmation email with the Google Meet link is on its way to {checkout.customer_details?.email}. Reminders
                follow one day and one hour before the session.
              </p>
            </div>
          ) : (
            <div>
              <h1 id='registered-heading'>Registration not confirmed</h1>
              <p>
                We could not confirm a payment for this registration. If you were charged, email
                elliott@texasaiconsulting.com and we will sort it out.
              </p>
            </div>
          )}
          <p>
            <Link href={`/workshops/${workshop.slug}`}>Back to {workshop.title}</Link>
          </p>
        </section>
      </div>
    </main>
  )
}
