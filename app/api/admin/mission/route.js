import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth.js'
import { query } from '../../../../lib/db.js'
import { getOrCreateProfile, weeklyScore } from '../../../../lib/playerStore.js'
import { isoWeekId } from '../../../../lib/leadImport.js'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  const callerId = auth.uid // per-caller progression (keyed on Firebase UID)

  const url = new URL(req.url)
  const weekId = url.searchParams.get('week') || isoWeekId(new Date())

  // Lead counts describe the shared weekly pool (week_id only)...
  const counts = await query(
    `select count(*)::int as total,
            count(*) filter (where status = 'not_called')::int as remaining,
            count(*) filter (where won)::int as won
       from leads where week_id = $1`,
    [weekId],
  )
  // ...weeklyScore is personal — sums only this caller's call_events for the week.
  const score = await weeklyScore(callerId, weekId)
  const profile = await getOrCreateProfile(callerId)

  return NextResponse.json({
    weekId,
    total: counts.rows[0].total,
    remaining: counts.rows[0].remaining,
    won: counts.rows[0].won,
    completed: counts.rows[0].total - counts.rows[0].remaining,
    weeklyScore: score,
    profile: {
      avatarId: profile.avatar_id,
      lifetimeXp: Number(profile.lifetime_xp),
      level: profile.level,
      rank: profile.rank,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
    },
  })
}
