import { NextResponse } from 'next/server'
import { adminAuth } from './firebaseAdmin.js'

function allowlist() {
  return (process.env.ADMIN_EMAIL_ALLOWLIST || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

// Returns { uid, email } on success, or { error: NextResponse } on failure.
// Every admin API route calls this FIRST.
export async function requireAdmin(req) {
  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return { error: NextResponse.json({ error: 'Missing auth token' }, { status: 401 }) }
  }
  let decoded
  try {
    decoded = await adminAuth().verifyIdToken(token)
  } catch {
    return { error: NextResponse.json({ error: 'Invalid auth token' }, { status: 401 }) }
  }
  const email = (decoded.email || '').toLowerCase()
  if (!email || !allowlist().includes(email)) {
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) }
  }
  return { uid: decoded.uid, email }
}
