'use client'

import { useState } from 'react'
import ReviewsFunnelHeader from '../components/ReviewsFunnelHeader'

const VOLUME_OPTIONS = ['0–10', '11–50', '51–100', '100+']

export default function ReviewsDemoPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    volume: '',
    contactTime: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'reviews_funnel_demo',
          message: `Reviews demo request. Volume: ${form.volume}. Preferred contact time: ${form.contactTime}.`,
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Submission failed (${response.status}): ${text.slice(0, 200)}`)
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main>
        <ReviewsFunnelHeader currentStep={1} />
        <section style={{ padding: '120px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#0e2042', fontSize: '32px', marginBottom: '16px' }}>
            Thanks — we&apos;ll be in touch
          </h1>
          <p style={{ color: '#555', lineHeight: 1.6 }}>
            Someone from the Texas AI team will reach out within one business day to schedule your demo.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main>
      <ReviewsFunnelHeader currentStep={1} />
      <section style={{ padding: '60px 24px 80px', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#0e2042', fontSize: '32px', marginBottom: '8px' }}>Book a demo</h1>
        <p style={{ color: '#555', marginBottom: '32px' }}>
          See how Texas AI Reviews works for a business like yours. 15-minute walkthrough, no slides.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label='Name' required value={form.name} onChange={handleChange('name')} />
          <Field label='Email' type='email' required value={form.email} onChange={handleChange('email')} />
          <Field label='Company' required value={form.company} onChange={handleChange('company')} />
          <Field label='Phone (optional)' type='tel' value={form.phone} onChange={handleChange('phone')} />

          <label style={{ fontSize: '14px', color: '#0e2042', fontWeight: 'bold' }}>
            Current monthly review volume
            <select
              required
              value={form.volume}
              onChange={handleChange('volume')}
              style={{
                marginTop: '4px',
                padding: '12px',
                width: '100%',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
              }}
            >
              <option value=''>— select —</option>
              {VOLUME_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <Field
            label='Preferred contact time'
            value={form.contactTime}
            onChange={handleChange('contactTime')}
            placeholder='e.g. weekday mornings CT'
          />

          {error && (
            <div style={{ background: '#fee', color: '#a00', padding: '12px', borderRadius: '4px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type='submit'
            disabled={submitting}
            style={{
              background: '#0e2042',
              color: '#ebcb4c',
              padding: '14px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              borderRadius: '6px',
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Sending…' : 'Request Demo'}
          </button>
        </form>
      </section>
    </main>
  )
}

function Field({ label, type = 'text', required, value, onChange, placeholder }) {
  return (
    <label style={{ fontSize: '14px', color: '#0e2042', fontWeight: 'bold' }}>
      {label}
      {required && <span style={{ color: '#a00' }}> *</span>}
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          marginTop: '4px',
          padding: '12px',
          width: '100%',
          border: '1px solid #d0d0d0',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      />
    </label>
  )
}
