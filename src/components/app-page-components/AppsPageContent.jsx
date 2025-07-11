'use client';

import AppList from './AppList';
import { getAllApps } from '../../data/apps';

export default function AppsPageContent() {
  // Get apps from centralized data source
  const apps = getAllApps();

  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <div className="max-w-full">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-[#2c75ff] mb-8 font-hesdeadjim"
              style={{textShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}>
            Interactive Applications
          </h1>
          <p className="text-xl text-white mb-12">
            Explore our collection of interactive tools and dashboards
          </p>
          
          <AppList apps={apps} />
        </div>
      </div>
    </div>
  );
}