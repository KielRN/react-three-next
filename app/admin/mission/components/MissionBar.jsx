'use client'
export default function MissionBar({ mission }) {
  if (!mission) return null
  const pct = mission.total ? Math.round((mission.completed / mission.total) * 100) : 0
  return (
    <div className='rounded-2xl bg-black/30 p-4 ring-1 ring-lcars-amber/40'>
      <div className='flex items-center justify-between text-xs uppercase tracking-widest text-lcars-amber'>
        <span>Week {mission.weekId}</span>
        <span className='text-ai-gold'>{mission.weeklyScore} pts</span>
      </div>
      <div className='mt-2 h-4 w-full overflow-hidden rounded-full bg-black/50'>
        <div className='h-full bg-lcars-amber transition-all' style={{ width: `${pct}%` }} />
      </div>
      <div className='mt-2 flex justify-between text-xs text-lcars-ice/70'>
        <span>{mission.completed}/{mission.total} called</span>
        <span>{mission.remaining} remaining · {mission.won} booked</span>
      </div>
    </div>
  )
}
