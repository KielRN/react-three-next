import { NextResponse } from 'next/server'
import { getStripeWorkshops } from '../../../lib/stripe-workshops'
import { createRegistrationCheckout, isRegistrationOpen, validateRegistration } from '../../../lib/workshop-registration'

export const runtime = 'nodejs'

export async function POST(request) {
  const origin = request.headers.get('origin')
  // Railway terminates HTTPS before the container; validate against the public site.
  const allowedOrigins = new Set(['https://texasaiconsulting.com', 'https://www.texasaiconsulting.com'])
  const host = request.headers.get('host') || new URL(request.url).host
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) allowedOrigins.add(`http://${host}`)
  if (!origin || !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: 'Register from the workshop page.' }, { status: 403 })
  }
  let input
  try {
    const text = await request.text()
    if (text.length > 4096) return NextResponse.json({ error: 'Your details are too long.' }, { status: 413 })
    input = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Check your details and try again.' }, { status: 400 })
  }
  const result = validateRegistration(input)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  if (!isRegistrationOpen(result.data.slug)) {
    return NextResponse.json({ error: 'Registration is not open for this workshop.' }, { status: 409 })
  }
  try {
    const checkout = await createRegistrationCheckout(getStripeWorkshops(), { data: result.data, origin })
    if (checkout.status === 'sold_out') {
      return NextResponse.json({ status: 'sold_out', error: 'This session is full.' }, { status: 409 })
    }
    if (checkout.status === 'closed') {
      return NextResponse.json({ error: 'Registration for this session has closed.' }, { status: 409 })
    }
    return NextResponse.json({ status: 'checkout', clientSecret: checkout.clientSecret })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[workshop-registration] checkout could not be started:', err.message)
    return NextResponse.json(
      { error: 'We could not start checkout. Please retry or email elliott@texasaiconsulting.com.' },
      { status: 502 },
    )
  }
}
