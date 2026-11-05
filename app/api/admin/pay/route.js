import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth.js'
import { getPayStatus } from '../../../../lib/payStore.js'

export const dynamic = 'force-dynamic'

// The signed-in caller's own prepaid balance. `pay` is null for callers without a pay account.
export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  try {
    const pay = await getPayStatus(auth.uid)
    return NextResponse.json({ pay }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
