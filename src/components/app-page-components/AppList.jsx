'use client'

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppCard from './AppCard';

// LCARS decoration component for section headers
const LCARSSectionHeader = ({ title }) => (
  <div className="flex items-center mb-4">
    <div className="flex items-center mr-3">
      <div className="h-8 w-3 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}></div>
      <div className="h-6 w-8 bg-[#ffcc00] rounded-sm ml-1" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
    </div>
    <h2 className="text-xl font-semibold text-[#2c75ff] font-hesdeadjim"
      style={{textShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}>
      {title}
    </h2>
  </div>
);

// Category tag component
const CategoryTag = ({ category, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1 text-sm transition-colors font-hesdeadjim ${
      active
        ? 'text-[#0e2042] bg-[#2c75ff]'
        : 'text-[#ffcc00] bg-[#0e2042] hover:bg-[#0e2042]/80'
    }`}
    style={{
      clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
      boxShadow: '0 0 8px rgba(44, 117, 255, 0.4)',
      textShadow: active ? '0 0 5px rgba(14, 32, 66, 0.7)' : '0 0 5px rgba(255, 204, 0, 0.7)',
      animation: active ? 'border-pulse 3s infinite' : 'none'
    }}
  >
    {category}
  </button>
);

export default function AppList({ apps }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get('category');
  
  // Get unique categories from apps
  const allCategories = [...new Set(apps.map(app => app.category))].filter(Boolean);
  
  // Filter apps by category if a category is selected
  const filteredApps = activeCategory
    ? apps.filter(app => app.category === activeCategory)
    : apps;
    
  // Handle category selection
  const handleCategoryClick = (category) => {
    if (category === activeCategory) {
      // Clicking active category removes the filter
      router.push('/apps', { scroll: false });
    } else {
      // Set category filter
      router.push(`/apps?category=${category}`, { scroll: false });
    }
  };
  return (
    <div className="relative" style={{
      background: 'linear-gradient(to bottom, rgba(0,10,30,0.3), rgba(0,0,0,0))',
      boxShadow: 'inset 0 3px 10px rgba(44, 117, 255, 0.2)',
    }}>
      {/* App Section Header with Category Filters */}
      <div className="mb-10 p-6 border-l-2 border-[#2c75ff]" style={{
        boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)',
      }}>
        <LCARSSectionHeader title="Interactive Applications" />
        
        {/* Only show category filters if we have multiple categories */}
        {allCategories.length > 1 && (
          <div className="mt-6">
            <h3 className="text-sm text-gray-300 mb-3">Filter by Category:</h3>
            <div className="flex flex-wrap gap-2">
              <CategoryTag
                category="All"
                active={!activeCategory}
                onClick={() => router.push('/apps', { scroll: false })}
              />
              {allCategories.map(category => (
                <CategoryTag
                  key={category}
                  category={category.charAt(0).toUpperCase() + category.slice(1)}
                  active={category === activeCategory}
                  onClick={() => handleCategoryClick(category)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Apps grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <Suspense key={app.id} fallback={
              <div className="h-80 bg-[#0e2042] animate-pulse rounded-lg border-l border-b border-[#2c75ff]"
                  style={{boxShadow: '0 0 10px rgba(44, 117, 255, 0.3)'}}></div>
            }>
              <AppCard app={app} />
            </Suspense>
          ))
        ) : (
          <div className="col-span-full py-12 text-center" style={{
            borderLeft: '2px solid #2c75ff',
            boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)',
            background: 'linear-gradient(to right, rgba(14,32,66,0.4), rgba(0,0,0,0.2))'
          }}>
            <h3 className="text-2xl font-semibold text-[#2c75ff] mb-4 font-hesdeadjim"
              style={{textShadow: '0 0 8px rgba(44, 117, 255, 0.7)'}}>
              No apps available yet
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}