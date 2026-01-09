import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the ROI calculator component
const ROICalculatorWithNoSSR = dynamic(
  () => import('../../../src/components/mini-apps/roi-calculator/ROICalculator'),
  { ssr: false }
);

export default function ROICalculatorPage() {
  return <ROICalculatorWithNoSSR />;
}

// Add metadata for better SEO
export const metadata = {
  title: 'AI Integration ROI Calculator | Texas AI Consulting',
  description: 'Calculate the potential return on investment when integrating AI into your business operations. Analyze uncollected billing recovery and missed call opportunities.',
};
