import { NextResponse } from 'next/server'
import { addContactNote, addContactTags, getContact, searchContactsByEmail } from '../../../../lib/ghl'
import { unsubscribeFromNewsletter, validateUnsubscribe } from '../../../../lib/newsletter'

export const runtime = 'nodejs'

const ghl = { addContactNote, addContactTags, getContact, searchContactsByEmail }

export async function POST(request) {
  const origin = request.headers.get('origin')
  // Railway terminates HTTPS before the container; validate against the public site.
  const allowedOrigins = new Set(['https://texasaiconsulting.com', 'https://www.texasaiconsulting.com'])
  const host = request.headers.get('host') || new URL(request.url).host
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) allowedOrigins.add(`http://${host}`)
  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: 'Unsubscribe from texasaiconsulting.com.' }, { status: 403 })
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected a JSON request.' }, { status: 415 })
  }
  let input
  try {
    const text = await request.text()
    if (text.length > 1024) return NextResponse.json({ error: 'Your request is too long.' }, { status: 413 })
    input = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Check your email address and try again.' }, { status: 400 })
  }
  const result = validateUnsubscribe(input)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  try {
    await unsubscribeFromNewsletter(result.data, ghl)
    // Same answer whether or not a contact matched.
    return NextResponse.json({ status: 'unsubscribed' })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[newsletter] unsubscribe could not be saved to GHL:', err.message)
    return NextResponse.json(
      { error: 'We could not confirm your unsubscribe. Please retry or email elliott@texasaiconsulting.com.' },
      { status: 502 },
    )
  }
}
