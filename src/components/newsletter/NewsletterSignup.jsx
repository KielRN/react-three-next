'use client'

import { useRef, useState } from 'react'
import { CONSENT_TEXT, newsletterSource } from '../../../lib/newsletter'

// Compact Texas AI Weekly signup. `source` becomes the GHL tag newsletter-src-<source>;
// with readSrcParam, a ?src= query (e.g. ?src=invite) overrides it.
export default function NewsletterSignup({
  source = 'newsletter',
  readSrcParam = false,
  heading = 'Get Texas AI Weekly',
  blurb = 'A 5-minute Thursday read on what AI is doing in Texas and what it means for your business. Free, from Elliott Lamboy.',
  id = 'newsletter-signup',
}) {
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
    const param = readSrcParam ? new URLSearchParams(window.location.search).get('src') : null
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.get('firstName'),
          email: form.get('email'),
          consent: form.get('consent') === 'on',
          website: form.get('website'),
          source: newsletterSource(param, source),
          page: window.location.pathname,
        }),
        signal: AbortSignal.timeout(30000),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.status !== 'subscribed') throw new Error(result.error || 'Your signup could not be confirmed.')
      setStatus('done')
    } catch (failure) {
      setError(failure.name === 'TimeoutError' ? 'That took too long. Please try again.' : failure.message)
      setStatus('error')
    } finally {
      pending.current = false
    }
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className='w-full rounded-lg border border-l-4 border-ai-gold/40 border-l-ai-gold bg-ai-navy/90 p-6 text-white shadow-[0_0_15px_rgba(44,117,255,0.3)] md:p-8'
    >
      <p className='mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-ai-gold'>Free weekly email</p>
      <h2 id={`${id}-heading`} className='mb-2 text-2xl font-bold text-white md:text-3xl'>
        {heading}
      </h2>
      <p className='mb-5 text-base leading-relaxed text-gray-200'>{blurb}</p>
      {status === 'done' ? (
        <div role='status' className='rounded-md border border-ai-gold/50 bg-black/30 p-4'>
          <p className='font-semibold text-ai-gold'>You&apos;re in.</p>
          <p className='text-gray-200'>
            Watch your inbox for a welcome email from Elliott. The next issue lands Thursday at 7 a.m. Central.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className='grid gap-3 md:grid-cols-[1fr_1.4fr_auto] md:items-end'>
          <label className='flex flex-col gap-1 text-sm text-gray-200' htmlFor={`${id}-first`}>
            First name
            <input
              id={`${id}-first`}
              name='firstName'
              autoComplete='given-name'
              required
              maxLength={100}
              className='rounded-md border border-gray-500 bg-white px-3 py-2 text-base text-gray-900'
            />
          </label>
          <label className='flex flex-col gap-1 text-sm text-gray-200' htmlFor={`${id}-email`}>
            Email
            <input
              id={`${id}-email`}
              name='email'
              type='email'
              autoComplete='email'
              required
              maxLength={254}
              className='rounded-md border border-gray-500 bg-white px-3 py-2 text-base text-gray-900'
            />
          </label>
          {/* Consent sits above the button on phones and spans the full row below the fields on desktop. */}
          <label className='flex items-start gap-2 text-sm text-gray-300 md:order-last md:col-span-3'>
            <input type='checkbox' name='consent' required className='mt-1 size-4 shrink-0' />
            <span>
              {CONSENT_TEXT} See the{' '}
              <a href='/privacy-policy' className='text-ai-gold underline'>
                privacy policy
              </a>
              .
            </span>
          </label>
          <button
            type='submit'
            disabled={status === 'sending'}
            className='rounded-md bg-ai-gold px-5 py-2.5 font-semibold text-black transition-colors hover:bg-ai-gold-hover disabled:opacity-60'
          >
            {status === 'sending' ? 'Signing up…' : 'Subscribe'}
          </button>
          <div className='hidden' aria-hidden='true'>
            <label>
              Website
              <input name='website' tabIndex={-1} autoComplete='off' />
            </label>
          </div>
          {error ? (
            <p role='alert' className='text-sm text-red-300 md:order-last md:col-span-3'>
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  )
}
