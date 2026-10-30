'use client'

import { useRef, useState } from 'react'
import styles from '../../../app/workshops/workshops.module.css'

export default function WorkshopInquiry({ slug, title }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
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
        }),
        signal: AbortSignal.timeout(45000),
      })
      const result = await response.json()
      if (!response.ok || result.status !== 'inquiry_received')
        throw new Error(result.error || 'Your inquiry could not be confirmed. Please try again.')
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
      {error && (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      )}
      <button className={styles.button} type='submit' disabled={status === 'sending'}>
        {status === 'sending' ? 'Saving inquiry…' : 'Send workshop inquiry'}
      </button>
      <p className={styles.finePrint}>
        An inquiry does not reserve a seat or subscribe you to marketing. You can also email{' '}
        <a href='mailto:elliott@texasaiconsulting.com'>elliott@texasaiconsulting.com</a>.
      </p>
    </form>
  )
}
