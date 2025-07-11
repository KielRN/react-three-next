'use client'

import { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import MarketCapacityChart from './charts/MarketCapacityChart';
import RegionalComparisonChart from './charts/RegionalComparisonChart';
import MarketSegmentationChart from './charts/MarketSegmentationChart';
import ForecastGauges from './charts/ForecastGauges';
import CallToAction from './CallToAction';
import DataCenterMap from './charts/DataCenterMap';
import AdvantageFactorsChart from './charts/AdvantageFactorsChart';

export default function DashboardLayout({ chartRefs }) {
  const [marketCapacity, setMarketCapacity] = useState([]);
  const [regionalComparison, setRegionalComparison] = useState([]);
  const [marketSegmentation, setMarketSegmentation] = useState([]);
  const [forecastData, setForecastData] = useState({});

  useEffect(() => {
    fetch('/dashboard-data/market-capacity.json').then(res => res.json()).then(setMarketCapacity);
    fetch('/dashboard-data/regional-comparison.json').then(res => res.json()).then(setRegionalComparison);
    fetch('/dashboard-data/market-segmentation.json').then(res => res.json()).then(setMarketSegmentation);
    fetch('/dashboard-data/forecast-data.json').then(res => res.json()).then(setForecastData);
    // Map data is now embedded in the component
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div ref={chartRefs['market-capacity']} className="lg:col-span-2">
            <MarketCapacityChart data={marketCapacity} />
          </div>
          <div ref={chartRefs['regional-comparison']}>
            <RegionalComparisonChart data={regionalComparison} />
          </div>
          <div ref={chartRefs['market-segmentation']}>
            <MarketSegmentationChart data={marketSegmentation} />
          </div>
          <div ref={chartRefs['forecast']} className="lg:col-span-2">
            <ForecastGauges data={forecastData} />
          </div>
          <div ref={chartRefs['advantage-factors']}>
            <AdvantageFactorsChart />
          </div>
          <div ref={chartRefs['map']} className="lg:col-span-3">
            <DataCenterMap />
          </div>
        </div>
        <CallToAction />
      </main>
    </div>
  );
}