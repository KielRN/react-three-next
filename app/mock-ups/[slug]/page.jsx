import { notFound } from 'next/navigation'
import { getMockupBySlug, getAllMockups } from '../../../lib/mockups'
import MockupViewer from '../../../src/components/mock-ups/MockupViewer'

export async function generateMetadata({ params }) {
  const mockup = await getMockupBySlug(params.slug)

  if (!mockup) {
    return { title: 'Mockup Not Found' }
  }

  return {
    title: `${mockup.title} — Mockup Review`,
    description: mockup.description || 'Review this UI mockup from Texas AI Consulting.',
    robots: { index: false, follow: false },
  }
}

export async function generateStaticParams() {
  const mockups = await getAllMockups()
  return mockups.map((m) => ({ slug: m.slug }))
}

export default async function MockupPage({ params }) {
  const mockup = await getMockupBySlug(params.slug)

  if (!mockup) {
    notFound()
  }

  return <MockupViewer mockup={mockup} />
}
