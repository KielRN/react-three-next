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
  title: 'Interactive Applications | Texas AI Consulting',
  description: 'Explore our collection of interactive tools and data visualization dashboards.',
};