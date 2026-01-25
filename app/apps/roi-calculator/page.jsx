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
  title: 'AI ROI Calculator - Calculate Your Return on Investment',
  description: 'Calculate the potential return on investment when integrating AI into your business operations. Analyze uncollected billing recovery, missed call opportunities, and employee time savings with our free ROI calculator.',
  keywords: ['AI ROI calculator', 'return on investment', 'AI integration', 'business automation ROI', 'AI cost savings', 'productivity calculator', 'Texas business tools'],
  openGraph: {
    title: 'AI Integration ROI Calculator | Texas AI Consulting',
    description: 'Calculate the potential return on investment when integrating AI into your business operations. Free tool for small businesses.',
    url: 'https://texasaiconsulting.com/apps/roi-calculator',
    type: 'website',
    images: [
      {
        url: '/img/Texas-AI-Consulting-ST-Logo-ICON.png',
        width: 1200,
        height: 630,
        alt: 'AI ROI Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Integration ROI Calculator | Texas AI Consulting',
    description: 'Calculate your AI return on investment with our free calculator.',
    images: ['/img/Texas-AI-Consulting-ST-Logo-ICON.png'],
  },
};
