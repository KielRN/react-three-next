import Link from 'next/link'
import PortfolioContent from '../../src/components/portfolio/PortfolioContent'

export const metadata = {
  title: 'Portfolio | Texas AI Consulting',
  description: 'Explore our recent client success stories and web development projects.',
  openGraph: {
    title: 'Portfolio | Texas AI Consulting',
    description: 'Explore our recent client success stories and web development projects.',
    url: 'https://texasai.consulting/portfolio',
    type: 'website',
  },
}

export default function PortfolioPage() {
  return <PortfolioContent />
}