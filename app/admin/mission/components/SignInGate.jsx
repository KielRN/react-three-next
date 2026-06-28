'use client'
import { useState } from 'react'
import { useAuth } from '../../AuthProvider'
import { STATE_ART } from '../../lib/assets'

export default function SignInGate({ denied }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (denied) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center'>
        <img src={STATE_ART.locked} alt='' className='w-48' />
        <h1 className='text-2xl uppercase tracking-widest text-lcars-rust'>Access Denied</h1>
        <p className='max-w-sm text-sm text-lcars-ice/70'>
          This account is not on the mission roster. Contact the commanding officer.
        </p>
      </div>
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email.trim(), password)
    } catch {
      setError('Authentication failed.')
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-8 p-6'>
      <h1 className='text-3xl uppercase tracking-[0.3em] text-ai-gold'>Mission Control</h1>
      <form onSubmit={onSubmit} className='flex w-full max-w-xs flex-col gap-4'>
        <input
          type='email' placeholder='OFFICER EMAIL' value={email}
          onChange={(e) => setEmail(e.target.value)} required
          className='rounded-full bg-black/40 px-5 py-3 uppercase tracking-wider outline-none ring-1 ring-lcars-amber/40 focus:ring-ai-gold'
        />
        <input
          type='password' placeholder='ACCESS CODE' value={password}
          onChange={(e) => setPassword(e.target.value)} required
          className='rounded-full bg-black/40 px-5 py-3 uppercase tracking-wider outline-none ring-1 ring-lcars-amber/40 focus:ring-ai-gold'
        />
        {error && <p className='text-center text-sm text-lcars-rust'>{error}</p>}
        <button type='submit' className='rounded-full bg-ai-gold px-5 py-3 font-bold uppercase tracking-widest text-ai-navy'>
          Engage
        </button>
      </form>
    </div>
  )
}
