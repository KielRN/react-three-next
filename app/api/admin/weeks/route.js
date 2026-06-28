import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth.js'
import { query } from '../../../../lib/db.js'
import { isoWeekId } from '../../../../lib/leadImport.js'

export const dynamic = 'force-dynamic'

// Lists every week that holds leads (newest first), so Mission Control can offer a
// week selector instead of being hard-locked to the current ISO week. The current
// week is always included — even when empty — so it's selectable as the default.
export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const res = await query(
    `select week_id,
            count(*)::int as total,
            count(*) filter (where status = 'not_called')::int as remaining,
            count(*) filter (where won)::int as won
       from leads
      group by week_id
      order by week_id desc`,
  )

  const current = isoWeekId(new Date())
  const weeks = res.rows.map((r) => ({
    weekId: r.week_id,
    total: r.total,
    remaining: r.remaining,
    won: r.won,
  }))
  if (!weeks.some((w) => w.weekId === current)) {
    weeks.unshift({ weekId: current, total: 0, remaining: 0, won: 0 })
    weeks.sort((a, b) => (a.weekId < b.weekId ? 1 : -1))
  }

  return NextResponse.json({ current, weeks })
}
