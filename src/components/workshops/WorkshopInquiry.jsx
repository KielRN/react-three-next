'use client'

import { useRef, useState } from 'react'
import styles from '../../../app/workshops/workshops.module.css'
import { OPT_IN_TEXT } from '../../../lib/newsletter'

export default function WorkshopInquiry({ slug, title }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [newsletter, setNewsletter] = useState('')
  const pending = useRef(false)
  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    pending.current = true
    setStatus('sending')
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/workshop-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: form.get('name'),
          email: form.get('email'),
          interest: form.get('interest'),
          message: form.get('message'),
          website: form.get('website'),
          consent: form.get('consent') === 'on',
          newsletter: form.get('newsletter') === 'on',
        }),
        signal: AbortSignal.timeout(45000),
      })
      const result = await response.json()
      if (!response.ok || result.status !== 'inquiry_received')
        throw new Error(result.error || 'Your inquiry could not be confirmed. Please try again.')
      setNewsletter(result.newsletter || '')
      setStatus('received')
    } catch (failure) {
      setError(
        failure.name === 'TimeoutError'
          ? 'The request took too long to confirm. Please retry or email Elliott.'
          : failure.message,
      )
      setStatus('error')
    } finally {
      pending.current = false
    }
  }
  if (status === 'received')
    return (
      <div className={styles.success} role='status' tabIndex={-1}>
        <h3>Inquiry received</h3>
        <p>We saved your interest in {title}. Elliott can follow up about availability and session details.</p>
        <p>This is an inquiry. No seat is reserved and no payment has been collected.</p>
        {newsletter === 'subscribed' ? <p>You&apos;re also signed up for Texas AI Weekly.</p> : null}
        {newsletter === 'failed' ? (
          <p>
            We could not add you to Texas AI Weekly. You can <a href='/newsletter'>sign up here</a>.
          </p>
        ) : null}
        <button type='button' className={styles.textButton} onClick={() => setStatus('idle')}>
          Ask about a different group or date
        </button>
      </div>
    )
  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor={`name-${slug}`}>
        Name
        <input id={`name-${slug}`} name='name' autoComplete='name' required maxLength={100} />
      </label>
      <label htmlFor={`email-${slug}`}>
        Email
        <input id={`email-${slug}`} name='email' type='email' autoComplete='email' required maxLength={254} />
      </label>
      <label htmlFor={`interest-${slug}`}>
        I’m interested in
        <select id={`interest-${slug}`} name='interest' defaultValue='public'>
          <option value='public'>The next public session</option>
          <option value='private'>A private group workshop</option>
        </select>
      </label>
      <label htmlFor={`message-${slug}`}>
        What would help? <span>(optional)</span>
        <textarea
          id={`message-${slug}`}
          name='message'
          rows={3}
          maxLength={2000}
          placeholder='Your goal, preferred dates or group size. Please leave out sensitive information.'
        />
      </label>
      <div className={styles.honeypot} aria-hidden='true'>
        <label>
          Website
          <input name='website' tabIndex={-1} autoComplete='off' />
        </label>
      </div>
      <label className={styles.consent}>
        <input type='checkbox' name='consent' required />
        <span>
          You may contact me about this workshop inquiry. See the <a href='/privacy-policy'>privacy policy</a>.
        </span>
      </label>
      <label className={styles.consent}>
        <input type='checkbox' name='newsletter' />
        <span>{OPT_IN_TEXT}</span>
      </label>
      {error && (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      )}
      <button className={styles.button} type='submit' disabled={status === 'sending'}>
        {status === 'sending' ? 'Saving inquiry…' : 'Send workshop inquiry'}
      </button>
      <p className={styles.finePrint}>
        An inquiry does not reserve a seat. It only adds you to the newsletter if you tick that box. You can also
        email{' '}
        <a href='mailto:elliott@texasaiconsulting.com'>elliott@texasaiconsulting.com</a>.
      </p>
    </form>
  )
}
