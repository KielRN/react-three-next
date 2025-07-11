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
  title: 'Central Texas Data Centers Dashboard | Texas AI Consulting',
  description: 'Interactive dashboard visualizing the explosive growth of data centers in Austin, San Antonio, and Waco regions of Central Texas.',
};