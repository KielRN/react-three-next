import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth.js'
import { query } from '../../../../lib/db.js'
import { getOrCreateProfile } from '../../../../lib/playerStore.js'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  const callerId = auth.uid // personal service record

  // Per-caller completed list: the leads THIS caller logged outcomes on (latest event per lead).
  const completed = await query(
    `select * from (
       select distinct on (l.id)
              l.id, l.business, l.phone, l.week_id,
              ce.outcome, ce.tier, (ce.outcome = 'booked') as won, ce.created_at as updated_at
         from call_events ce
         join leads l on l.id = ce.lead_id
        where ce.caller_id = $1
        order by l.id, ce.created_at desc
     ) t
     order by updated_at desc
     limit 200`,
    [callerId],
  )
  // Per-caller weekly roll-up from this caller's own events.
  const byWeek = await query(
    `select l.week_id,
            count(distinct ce.lead_id)::int as called,
            count(*) filter (where ce.outcome = 'booked')::int as booked,
            coalesce(sum(ce.points), 0)::int as points
       from call_events ce
       join leads l on l.id = ce.lead_id
      where ce.caller_id = $1
      group by l.week_id
      order by l.week_id desc`,
    [callerId],
  )
  const profile = await getOrCreateProfile(callerId)

  return NextResponse.json({
    profile: {
      lifetimeXp: Number(profile.lifetime_xp),
      level: profile.level,
      rank: profile.rank,
      longestStreak: profile.longest_streak,
    },
    weeks: byWeek.rows,
    completed: completed.rows,
  })
}
