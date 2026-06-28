'use client'
import { AVATARS, AVATAR_FRAME, RANK_BADGE, XP } from '../../lib/assets'
import { xpForLevel } from '../../../../lib/scoring'

export default function PlayerHud({ profile, onPickAvatar }) {
  if (!profile) return null
  const avatarIdx = profile.avatarId
    ? Number(String(profile.avatarId).replace('avatar-', '')) - 1
    : 0
  const floor = xpForLevel(profile.level)
  const ceil = xpForLevel(profile.level + 1)
  const pct = ceil > floor ? Math.min(100, Math.round(((profile.lifetimeXp - floor) / (ceil - floor)) * 100)) : 0

  return (
    <div className='flex items-center gap-4 rounded-2xl bg-black/30 p-3 ring-1 ring-lcars-violet/40'>
      <button onClick={onPickAvatar} className='relative h-16 w-16 shrink-0' aria-label='Change avatar'>
        <img src={AVATAR_FRAME} alt='' className='absolute inset-0' />
        <img src={AVATARS[avatarIdx] || AVATARS[0]} alt='avatar' className='absolute inset-1.5 rounded-full' />
      </button>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <img src={RANK_BADGE[profile.rank] || RANK_BADGE.Cadet} alt='' className='h-5 w-5' />
          <span className='uppercase tracking-widest text-ai-gold'>{profile.rank}</span>
          <span className='text-lcars-ice/60'>· LVL {profile.level}</span>
        </div>
        <div className='mt-1 h-3 w-full overflow-hidden rounded-full bg-black/50'>
          <div className='h-full bg-lcars-violet' style={{ width: `${pct}%` }} />
        </div>
        <div className='mt-1 flex items-center gap-1 text-xs text-lcars-ice/60'>
          <img src={XP.chip} alt='' className='h-3 w-3' />
          {profile.lifetimeXp} XP · 🔥 {profile.currentStreak} day streak
        </div>
      </div>
    </div>
  )
}
