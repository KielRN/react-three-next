import Link from 'next/link'
import PortfolioContent from '../../src/components/portfolio/PortfolioContent'

export const metadata = {
  title: 'Portfolio - Client Success Stories',
  description: 'Explore our recent client success stories and web development projects. See how we help small businesses in San Antonio, Austin, and Central Texas leverage AI technology.',
  keywords: ['portfolio', 'client success stories', 'web development projects', 'AI projects', 'Texas business solutions'],
  openGraph: {
    title: 'Portfolio | Texas AI Consulting',
    description: 'Explore our recent client success stories and web development projects. See how we help small businesses in San Antonio, Austin, and Central Texas leverage AI technology.',
    url: 'https://texasaiconsulting.com/portfolio',
    type: 'website',
    images: [
      {
        url: '/img/Texas-AI-Consulting-ST-Logo-ICON.png',
        width: 1200,
        height: 630,
        alt: 'Texas AI Consulting Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Texas AI Consulting',
    description: 'Explore our recent client success stories and web development projects.',
    images: ['/img/Texas-AI-Consulting-ST-Logo-ICON.png'],
  },
}

export default function PortfolioPage() {
  return <PortfolioContent />
}