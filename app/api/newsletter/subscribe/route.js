import { NextResponse } from 'next/server'
import { addContactNote, addContactTags, removeContactTags, searchContactsByEmail, upsertContact } from '../../../../lib/ghl'
import { CONSENT_TEXT, subscribeToNewsletter, validateNewsletterSignup } from '../../../../lib/newsletter'

export const runtime = 'nodejs'

const ghl = { addContactNote, addContactTags, removeContactTags, searchContactsByEmail, upsertContact }

export async function POST(request) {
  const origin = request.headers.get('origin')
  // Railway terminates HTTPS before the container; validate against the public site.
  const allowedOrigins = new Set(['https://texasaiconsulting.com', 'https://www.texasaiconsulting.com'])
  const host = request.headers.get('host') || new URL(request.url).host
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) allowedOrigins.add(`http://${host}`)
  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: 'Sign up from texasaiconsulting.com.' }, { status: 403 })
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected a JSON signup.' }, { status: 415 })
  }
  let input
  try {
    const text = await request.text()
    if (text.length > 4096) return NextResponse.json({ error: 'Your details are too long.' }, { status: 413 })
    input = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Check your details and try again.' }, { status: 400 })
  }
  const result = validateNewsletterSignup(input)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  const { firstName, email, source, page } = result.data
  try {
    await subscribeToNewsletter({ email, firstName, source, page, consentText: CONSENT_TEXT }, ghl)
    return NextResponse.json({ status: 'subscribed' })
  } catch (err) {
    // Do not expose CRM responses or claim success after a partial save.
    // eslint-disable-next-line no-console
    console.error('[newsletter] signup could not be saved to GHL:', err.message)
    return NextResponse.json(
      { error: 'We could not confirm your signup. Please retry or email elliott@texasaiconsulting.com.' },
      { status: 502 },
    )
  }
}
