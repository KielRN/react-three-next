import { getMockupImage } from '../../../../../lib/mockups'
import { NextResponse } from 'next/server'

/**
 * Streams mockup images from content/mock-ups/{slug}/screens/...
 * URL pattern: /api/mock-ups/image/{slug}/{filepath}
 * Example:     /api/mock-ups/image/acme-dashboard/screens/desktop-home.webp
 */
export async function GET(request, { params }) {
  const segments = params.path
  if (!segments || segments.length < 2) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const slug = segments[0]
  const filePath = segments.slice(1).join('/')

  const result = await getMockupImage(slug, filePath)
  if (!result) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  return new NextResponse(result.buffer, {
    status: 200,
    headers: {
      'Content-Type': result.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
