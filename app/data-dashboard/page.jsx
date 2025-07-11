'use client';

import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../../src/components/dashboard/DashboardLayout';
import { useEffect, useRef } from 'react';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const highlightedChart = searchParams.get('chart');
  const chartRefs = {
    'market-capacity': useRef(null),
    'regional-comparison': useRef(null),
    'market-segmentation': useRef(null),
    'forecast': useRef(null),
    'advantage-factors': useRef(null),
    'map': useRef(null),
  };
  
  useEffect(() => {
    if (highlightedChart && chartRefs[highlightedChart]?.current) {
      // Scroll to the specific chart with a highlight effect
      chartRefs[highlightedChart].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add a highlight animation
      chartRefs[highlightedChart].current.classList.add('highlight-chart');
      setTimeout(() => {
        chartRefs[highlightedChart].current.classList.remove('highlight-chart');
      }, 2000);
    }
  }, [highlightedChart, chartRefs]);

  return (
    <DashboardLayout chartRefs={chartRefs} />
  );
}