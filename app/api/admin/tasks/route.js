import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth.js'
import { businessDate, businessWeek, weekForDate } from '../../../../lib/taskSchedule.js'
import { getTaskWeek } from '../../../../lib/taskStore.js'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  const week = new URL(req.url).searchParams.get('week') || weekForDate(businessDate())
  try { businessWeek(week) } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  try {
    return NextResponse.json(await getTaskWeek(auth.uid, week), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('Task list failed:', error.code || error.name) // eslint-disable-line no-console
    return NextResponse.json({ error: 'Tasks could not be loaded. Please try again or contact your administrator.' }, { status: 503 })
  }
}
