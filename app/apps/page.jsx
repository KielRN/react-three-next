import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid ESM import issues
const AppsPageContent = dynamic(
  () => import('../../src/components/app-page-components/AppsPageContent'),
  { ssr: false }
);

export default function AppsPage() {
  return <AppsPageContent />;
}

// Add metadata for SEO
export const metadata = {
  title: 'Interactive Applications & Tools',
  description: 'Explore our collection of interactive AI-powered tools and data visualization dashboards designed for small businesses in Texas. ROI calculators, market analysis, and more.',
  keywords: ['AI tools', 'business calculators', 'ROI calculator', 'data visualization', 'interactive dashboards', 'Texas business tools'],
  openGraph: {
    title: 'Interactive Applications | Texas AI Consulting',
    description: 'Explore our collection of interactive AI-powered tools and data visualization dashboards designed for small businesses in Texas.',
    url: 'https://texasaiconsulting.com/apps',
    type: 'website',
    images: [
      {
        url: '/img/Texas-AI-Consulting-ST-Logo-ICON.png',
        width: 1200,
        height: 630,
        alt: 'Texas AI Consulting Applications',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Applications | Texas AI Consulting',
    description: 'Explore our collection of interactive AI-powered tools and data visualization dashboards.',
    images: ['/img/Texas-AI-Consulting-ST-Logo-ICON.png'],
  },
};