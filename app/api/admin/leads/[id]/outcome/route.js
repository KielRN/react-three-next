import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../../lib/adminAuth.js'
import { recordOutcome } from '../../../../../../lib/playerStore.js'

export const dynamic = 'force-dynamic'

const VALID_OUTCOMES = ['called', 'no_answer', 'follow_up', 'not_interested', 'disqualified', 'booked']
const VALID_TIERS = ['starter', 'growth', 'pro']

export async function POST(req, { params }) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  const callerId = auth.uid // per-caller — the event + profile update belong to this caller
  const leadId = params.id

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { outcome, tier, note } = body

  if (!VALID_OUTCOMES.includes(outcome)) {
    return NextResponse.json(
      { error: `Invalid outcome. One of: ${VALID_OUTCOMES.join(', ')}` },
      { status: 400 },
    )
  }
  if (outcome === 'booked' && !VALID_TIERS.includes(tier)) {
    return NextResponse.json(
      { error: `Booked requires a tier. One of: ${VALID_TIERS.join(', ')}` },
      { status: 400 },
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  try {
    const result = await recordOutcome({ callerId, leadId, outcome, tier, note, today })
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
