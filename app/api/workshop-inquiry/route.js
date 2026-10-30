import { NextResponse } from 'next/server'
import { upsertContact, addContactTags, addContactNote } from '../../../lib/ghl'
import { submitWorkshopInquiry, validateWorkshopInquiry } from '../../../lib/workshop-inquiry'

export const runtime = 'nodejs'

export async function POST(request) {
  const origin = request.headers.get('origin')
  // Railway terminates HTTPS before the container; Request.url can therefore
  // contain 0.0.0.0:PORT. Validate against the public site, not that internal URL.
  const allowedOrigins = new Set(['https://texasaiconsulting.com', 'https://www.texasaiconsulting.com'])
  const host = request.headers.get('host') || new URL(request.url).host
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) allowedOrigins.add(`http://${host}`)
  if (origin && !allowedOrigins.has(origin)) {
    return NextResponse.json({ error: 'Submit this form from the workshop page.' }, { status: 403 })
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Expected a JSON inquiry.' }, { status: 415 })
  }
  // Read the stream with a real byte limit; Content-Length alone is not trusted.
  let input
  try {
    const reader = request.body?.getReader()
    if (!reader) throw new Error('Missing body')
    const chunks = []
    let size = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 8192) {
        await reader.cancel()
        return NextResponse.json({ error: 'Your inquiry is too long.' }, { status: 413 })
      }
      chunks.push(Buffer.from(value))
    }
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return NextResponse.json({ error: 'Check your inquiry details and try again.' }, { status: 400 })
  }
  const result = validateWorkshopInquiry(input)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  try {
    const response = await submitWorkshopInquiry(input, { upsertContact, addContactTags, addContactNote })
    return NextResponse.json(response)
  } catch {
    // Do not expose CRM responses or claim success after a partial save.
    // eslint-disable-next-line no-console
    console.error('Workshop inquiry could not be fully saved to GHL.')
    return NextResponse.json(
      { error: 'We could not confirm your inquiry. Please retry or email elliott@texasaiconsulting.com.' },
      { status: 502 },
    )
  }
}
