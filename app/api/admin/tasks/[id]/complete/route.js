import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../../lib/adminAuth.js'
import { completeTask } from '../../../../../../lib/taskStore.js'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
    return NextResponse.json({ error: 'Invalid task ID.' }, { status: 400 })
  }
  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }
  if (!body || Array.isArray(body) || typeof body !== 'object' || (body.note !== undefined && (typeof body.note !== 'string' || body.note.length > 2000))) {
    return NextResponse.json({ error: 'Completion note must be text, at most 2,000 characters.' }, { status: 400 })
  }
  try {
    return NextResponse.json(await completeTask({ callerId: auth.uid, taskId: params.id, note: body.note?.trim() || '' }))
  } catch (error) {
    if (error.status) return NextResponse.json({ error: error.message }, { status: error.status })
    console.error('Task completion failed:', error.code || error.name) // eslint-disable-line no-console
    return NextResponse.json({ error: 'Completion could not be saved. Please retry; rewards are only granted once.' }, { status: 503 })
  }
}
