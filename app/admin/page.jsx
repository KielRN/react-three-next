'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { getProfile } from './lib/api'
import SignInGate from './mission/components/SignInGate'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setProfile(null)
    setError(null)
    if (user) getProfile().then((p) => { if (active) setProfile(p) }).catch((e) => { if (active) setError(e) })
    return () => { active = false }
  }, [user, retry])
  if (loading) return <p className='p-6'>Loading command…</p>
  if (!user) return <SignInGate />
  if (error?.status === 403) return <SignInGate denied />
  return (
    <main className='mx-auto max-w-5xl px-4 py-10 sm:py-16'>
      <p className='text-xs uppercase tracking-[0.25em] text-lcars-teal'>Texas AI Consulting / Operations</p>
      <h1 className='mt-3 text-3xl font-bold text-white sm:text-4xl'>Your next move starts here.</h1>
      <p className='mt-4 max-w-xl text-sm leading-7 text-lcars-ice/70'>Work your missions. Keep the business moving. Every completed task builds the same service record.</p>
      {error ? <div role='alert' className='mt-6 text-lcars-amber'>Could not load your profile. <button onClick={() => setRetry((n) => n + 1)} className='underline'>Retry</button></div> : !profile ? <p className='mt-6'>Loading profile…</p> : <>
        <p className='mt-6 text-sm text-ai-gold'>{profile.rank} · Level {profile.level} · {profile.lifetimeXp} XP</p>
        <div className='mt-10 grid gap-4 sm:grid-cols-2'>
          <Link href='/admin/tasks' className='group rounded-2xl border border-lcars-teal/40 bg-black/25 p-6 transition-colors hover:bg-lcars-teal/10'>
            <span className='text-xs uppercase tracking-widest text-lcars-teal'>01 / Daily operations</span>
            <h2 className='mt-6 text-2xl font-bold text-white'>Tasks <span aria-hidden='true'>→</span></h2>
            <p className='mt-3 text-sm leading-6 text-lcars-ice/70'>Your business-day checklist. Content, conversations, and follow-through — with points and XP for each completion.</p>
          </Link>
          <Link href='/admin/mission' className='group rounded-2xl border border-lcars-violet/40 bg-black/25 p-6 transition-colors hover:bg-lcars-violet/10'>
            <span className='text-xs uppercase tracking-widest text-lcars-violet'>02 / Build the pipeline</span>
            <h2 className='mt-6 text-2xl font-bold text-white'>Missions <span aria-hidden='true'>→</span></h2>
            <p className='mt-3 text-sm leading-6 text-lcars-ice/70'>Work the weekly calling list, log outcomes, and turn the next conversation into a win.</p>
          </Link>
        </div>
      </>}
    </main>
  )
}
