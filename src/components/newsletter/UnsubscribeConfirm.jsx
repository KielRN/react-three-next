'use client'

import { useRef, useState } from 'react'

// Confirm step for Texas AI Weekly unsubscribes. With a contact ID from the email link one click
// confirms; without it (older emails) the reader types the address they get the newsletter at.
export default function UnsubscribeConfirm({ contactId = '' }) {
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
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactId ? { contactId } : { email: form.get('email') }),
        signal: AbortSignal.timeout(30000),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.status !== 'unsubscribed') throw new Error(result.error || 'Your unsubscribe could not be confirmed.')
      window.location.assign('/newsletter/unsubscribed')
    } catch (failure) {
      setError(failure.name === 'TimeoutError' ? 'That took too long. Please try again.' : failure.message)
      setStatus('error')
      pending.current = false
    }
  }

  return (
    <form onSubmit={submit} className='flex flex-col gap-4'>
      {contactId ? null : (
        <label className='flex max-w-md flex-col gap-1 text-sm text-gray-200' htmlFor='unsubscribe-email'>
          Email address
          <input
            id='unsubscribe-email'
            name='email'
            type='email'
            autoComplete='email'
            required
            maxLength={254}
            className='rounded-md border border-gray-500 bg-white px-3 py-2 text-base text-gray-900'
          />
        </label>
      )}
      <button
        type='submit'
        disabled={status === 'sending'}
        className='w-fit rounded-md bg-ai-gold px-5 py-2.5 font-semibold text-black transition-colors hover:bg-ai-gold-hover disabled:opacity-60'
      >
        {status === 'sending' ? 'Unsubscribing…' : 'Unsubscribe me'}
      </button>
      {error ? (
        <p role='alert' className='text-sm text-red-300'>
          {error}
        </p>
      ) : null}
    </form>
  )
}
