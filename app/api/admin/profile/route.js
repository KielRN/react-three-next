import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/adminAuth.js'
import { getOrCreateProfile, setAvatar } from '../../../../lib/playerStore.js'

export const dynamic = 'force-dynamic'

const VALID_AVATARS = ['avatar-01', 'avatar-02', 'avatar-03', 'avatar-04', 'avatar-05', 'avatar-06']

export async function GET(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  const p = await getOrCreateProfile(auth.uid)
  return NextResponse.json({
    avatarId: p.avatar_id,
    lifetimeXp: Number(p.lifetime_xp),
    level: p.level,
    rank: p.rank,
    currentStreak: p.current_streak,
    longestStreak: p.longest_streak,
  })
}

export async function PUT(req) {
  const auth = await requireAdmin(req)
  if (auth.error) return auth.error
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!VALID_AVATARS.includes(body.avatarId)) {
    return NextResponse.json({ error: 'Invalid avatarId' }, { status: 400 })
  }
  const p = await setAvatar(auth.uid, body.avatarId)
  return NextResponse.json({ avatarId: p.avatar_id })
}
