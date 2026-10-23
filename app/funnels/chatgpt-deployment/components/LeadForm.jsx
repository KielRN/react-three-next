'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EVENTS, identifyUser, measure, newEventId } from './pixel'

const TEAM_SIZES = ['1–10', '11–25', '26–100', '100+']
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

export default function LeadForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    teamSize: '',
    workflow: '',
    website: '', // honeypot: real visitors never see or fill this
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const params = new URLSearchParams(window.location.search)
    const utm = Object.fromEntries(UTM_KEYS.filter((k) => params.get(k)).map((k) => [k, params.get(k)]))
    const eventId = newEventId('lead')

    try {
      const response = await fetch('/api/ghl/chatgpt-deployment-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, utm, eventId, pageUrl: window.location.href }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true) {
        throw new Error(result?.error || 'We could not save your request. Please try again or book a call.')
      }

      // Conversion fires only after the lead is saved, so Ads Manager counts real leads.
      if (result.accepted !== false) {
        await identifyUser(form)
        measure(EVENTS.LEAD_CREATED, { type: 'customer_action' }, { event_id: eventId })
      }
      router.push('/funnels/chatgpt-deployment/thank-you')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='cgd-form'>
      <div className='cgd-form-row'>
        <Field label='First name' required value={form.firstName} onChange={handleChange('firstName')} autoComplete='given-name' />
        <Field label='Last name' required value={form.lastName} onChange={handleChange('lastName')} autoComplete='family-name' />
      </div>
      <Field label='Work email' type='email' required value={form.email} onChange={handleChange('email')} autoComplete='email' />
      <Field label='Company' required value={form.company} onChange={handleChange('company')} autoComplete='organization' />
      <div className='cgd-form-row'>
        <Field label='Phone (optional)' type='tel' value={form.phone} onChange={handleChange('phone')} autoComplete='tel' />
        <label className='cgd-label'>
          <span>
            Team size<span className='cgd-req'> *</span>
          </span>
          <select required value={form.teamSize} onChange={handleChange('teamSize')} className='cgd-input'>
            <option value=''>Select</option>
            {TEAM_SIZES.map((v) => (
              <option key={v} value={v}>
                {v} people
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className='cgd-label'>
        Which recurring work takes the most time? (optional)
        <textarea
          rows={3}
          maxLength={4000}
          value={form.workflow}
          onChange={handleChange('workflow')}
          className='cgd-input'
          placeholder='e.g. proposals, weekly client reports, intake paperwork'
        />
      </label>

      <label className='cgd-honeypot' aria-hidden='true'>
        Website
        <input tabIndex={-1} autoComplete='off' value={form.website} onChange={handleChange('website')} />
      </label>

      {error && <div className='cgd-error' role='alert'>{error} <Link href='/funnels/chatgpt-deployment/book'>Book a call instead</Link>.</div>}

      <button type='submit' disabled={submitting} className='cgd-btn cgd-btn-primary cgd-btn-block'>
        {submitting ? 'Sending…' : 'Request my consultation'}
      </button>
      <p className='cgd-fineprint'>
        We&apos;ll reply within one business day. By submitting, you agree to be contacted by Texas AI Consulting about
        your request. See our <Link href='/privacy-policy'>Privacy Policy</Link>.
      </p>
    </form>
  )
}

function Field({ label, type = 'text', required, value, onChange, autoComplete }) {
  return (
    <label className='cgd-label'>
      <span>
        {label}
        {required && <span className='cgd-req'> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        maxLength={type === 'email' ? 254 : type === 'tel' ? 40 : label === 'Company' ? 200 : 100}
        className='cgd-input'
      />
    </label>
  )
}
