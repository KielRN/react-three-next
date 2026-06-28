'use client'

// Compact week dropdown for Mission Control. `weeks` comes from /api/admin/weeks
// ([{ weekId, total, remaining, won }]); `value` is the selected weekId (or null =
// current). Lets the caller view past / staged weeks instead of being locked to the
// current ISO week.
export default function WeekSelector({ weeks, value, current, onChange }) {
  if (!weeks?.length) return null
  return (
    <label className='flex items-center gap-2 text-xs uppercase tracking-widest text-lcars-ice/70'>
      <span>Week</span>
      <select
        value={value || current || ''}
        onChange={(e) => onChange(e.target.value)}
        className='rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold tracking-wider text-lcars-ice outline-none ring-1 ring-lcars-amber/40'>
        {weeks.map((w) => (
          <option key={w.weekId} value={w.weekId} className='bg-ai-navy'>
            {w.weekId}
            {w.weekId === current ? ' (current)' : ''} · {w.total} lead{w.total === 1 ? '' : 's'}
            {w.remaining ? ` · ${w.remaining} left` : ''}
          </option>
        ))}
      </select>
    </label>
  )
}
