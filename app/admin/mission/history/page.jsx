'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../AuthProvider'
import SignInGate from '../components/SignInGate'
import { getProfile } from '../../lib/api'

async function getHistory() {
  const { auth } = await import('../../../../lib/firebaseClient')
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
  const res = await fetch('/api/admin/history', { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) { const e = new Error('failed'); e.status = res.status; throw e }
  return res.json()
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (!user) return
    getProfile().catch(() => {}) // warms the profile row
    getHistory().then(setData).catch((e) => { if (e.status === 403) setDenied(true) })
  }, [user])

  if (authLoading) return null
  if (!user) return <SignInGate />
  if (denied) return <SignInGate denied />
  if (!data) return <p className='p-6 uppercase tracking-widest text-lcars-ice/60'>Loading history…</p>

  return (
    <main className='mx-auto flex max-w-md flex-col gap-4 p-4 pb-24'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl uppercase tracking-widest text-ai-gold'>Service Record</h1>
        <Link href='/admin/mission' className='text-xs uppercase tracking-widest text-ai-blue'>← Mission</Link>
      </div>

      <div className='rounded-2xl bg-black/30 p-4 ring-1 ring-lcars-violet/40 text-sm'>
        {data.profile.rank} · LVL {data.profile.level} · {data.profile.lifetimeXp} XP · best streak {data.profile.longestStreak}
      </div>

      <section>
        <h2 className='mb-2 text-xs uppercase tracking-widest text-lcars-amber'>By Week</h2>
        <div className='flex flex-col gap-2'>
          {data.weeks.map((w) => (
            <div key={w.week_id} className='flex justify-between rounded-xl bg-black/20 px-4 py-2 text-sm'>
              <span>{w.week_id}</span>
              <span className='text-lcars-ice/70'>{w.called} called · {w.booked} booked · {w.points} pts</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className='mb-2 text-xs uppercase tracking-widest text-lcars-amber'>Completed Leads</h2>
        <div className='flex flex-col gap-1'>
          {data.completed.map((l) => (
            <div key={l.id} className='flex justify-between rounded-lg bg-black/20 px-3 py-2 text-xs'>
              <span className='truncate'>{l.business}</span>
              <span className={l.won ? 'text-lcars-teal' : 'text-lcars-ice/60'}>
                {l.won ? `BOOKED · ${l.tier}` : l.outcome}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
