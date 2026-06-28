import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth.js'
import { query } from '../../../../lib/db.js'
import { isoWeekId } from '../../../../lib/leadImport.js'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error

  const url = new URL(req.url)
  const weekId = url.searchParams.get('week') || isoWeekId(new Date())

  // Shared weekly pool (week_id only). Next-best ordering: not_called first, then
  // follow_up, then everything else; within a group, oldest created first → deterministic resume.
  const res = await query(
    `select id, business, owner, phone, address, rating, reviews_count,
            last_review, competitor, context, status, notes, won, won_tier
       from leads
      where week_id = $1
      order by
        case status
          when 'not_called' then 0
          when 'follow_up' then 1
          else 2
        end,
        created_at asc`,
    [weekId],
  )
  return NextResponse.json({ weekId, leads: res.rows })
}
