import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the component that uses client-side libraries
const DashboardWithNoSSR = dynamic(
  () => import('../../../src/components/mini-apps/central-texas-data-centers-dashboard/DashboardWrapper'),
  { ssr: false }
);

export default function CentralTexasDataCentersPage() {
  return <DashboardWithNoSSR />;
}

// Add metadata for better SEO
export const metadata = {
  title: 'Central Texas Data Centers Dashboard - Market Analysis',
  description: 'Interactive dashboard visualizing the explosive growth of data centers in Austin, San Antonio, and Waco regions of Central Texas. Explore market capacity, regional comparisons, and growth forecasts.',
  keywords: ['Central Texas data centers', 'Austin data centers', 'San Antonio data centers', 'Waco data centers', 'data center market analysis', 'Texas infrastructure', 'data center growth'],
  openGraph: {
    title: 'Central Texas Data Centers Dashboard | Texas AI Consulting',
    description: 'Interactive dashboard visualizing the explosive growth of data centers in Austin, San Antonio, and Waco regions of Central Texas.',
    url: 'https://texasaiconsulting.com/apps/central-texas-data-centers',
    type: 'website',
    images: [
      {
        url: '/img/Texas-AI-Consulting-ST-Logo-ICON.png',
        width: 1200,
        height: 630,
        alt: 'Central Texas Data Centers Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Central Texas Data Centers Dashboard | Texas AI Consulting',
    description: 'Interactive data center market analysis for Austin, San Antonio, and Waco.',
    images: ['/img/Texas-AI-Consulting-ST-Logo-ICON.png'],
  },
};