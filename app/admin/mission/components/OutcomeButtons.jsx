'use client'
import { useState } from 'react'

const OUTCOMES = [
  { key: 'no_answer', label: 'No Answer', color: 'bg-lcars-ice/20' },
  { key: 'follow_up', label: 'Follow Up', color: 'bg-lcars-amber/80 text-ai-navy' },
  { key: 'not_interested', label: 'Not Interested', color: 'bg-lcars-ice/20' },
  { key: 'disqualified', label: 'Disqualified', color: 'bg-lcars-rust/80' },
  { key: 'booked', label: 'Booked ✦', color: 'bg-lcars-teal text-ai-navy' },
]
const TIERS = [
  { key: 'starter', label: 'Starter (+0)' },
  { key: 'growth', label: 'Growth (+500)' },
  { key: 'pro', label: 'Pro (+1500)' },
]

export default function OutcomeButtons({ onSubmit, busy }) {
  const [pendingBooked, setPendingBooked] = useState(false)
  const [note, setNote] = useState('')

  function choose(key) {
    if (key === 'booked') { setPendingBooked(true); return }
    onSubmit({ outcome: key, note: note.trim() || undefined })
  }
  function chooseTier(tier) {
    onSubmit({ outcome: 'booked', tier, note: note.trim() || undefined })
    setPendingBooked(false)
  }

  if (pendingBooked) {
    return (
      <div className='grid gap-2'>
        <p className='text-center text-sm uppercase tracking-widest text-lcars-teal'>Select won tier</p>
        {TIERS.map((t) => (
          <button key={t.key} disabled={busy} onClick={() => chooseTier(t.key)}
            className='rounded-full bg-lcars-teal py-3 font-bold uppercase tracking-wider text-ai-navy disabled:opacity-50'>
            {t.label}
          </button>
        ))}
        <button onClick={() => setPendingBooked(false)} className='text-xs text-lcars-ice/60'>cancel</button>
      </div>
    )
  }

  return (
    <div className='grid gap-2'>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder='Quick note (optional)'
        className='rounded-full bg-black/40 px-4 py-2 text-sm outline-none ring-1 ring-lcars-ice/20' />
      <div className='grid grid-cols-2 gap-2'>
        {OUTCOMES.map((o) => (
          <button key={o.key} disabled={busy} onClick={() => choose(o.key)}
            className={`rounded-full py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50 ${o.color} ${o.key === 'booked' ? 'col-span-2' : ''}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
