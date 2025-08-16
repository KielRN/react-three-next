# Interactive Texas Data Centers Map - Implementation Guide

This document provides detailed guidance for implementing the Interactive Texas Data Centers Map application, including component development, data integration, and feature implementation.

## Prerequisites

Before beginning implementation, ensure you have:

1. Next.js project set up (react-three-next)
2. Access to the Texas map GeoJSON data
3. Data center information extracted from the blog post
4. Required dependencies installed:
   - react-simple-maps
   - framer-motion
   - tailwindcss

## Implementation Steps

### 1. Set Up Directory Structure

Create the following directory structure:

```
react-three-next/
├── app/
│   └── apps/
│       └── interactive-texas-data-centers-map/
│           └── page.jsx
├── src/
│   └── components/
│       └── mini-apps/
│           └── interactive-texas-data-centers-map/
│               ├── MapWrapper.jsx
│               ├── MapLayout.jsx
│               ├── FilterControls.jsx
│               └── charts/
│                   ├── InteractiveMap.jsx
│                   ├── CapacityChart.jsx
│                   ├── ComparisonChart.jsx
│                   └── SegmentationChart.jsx
└── public/
    └── data/
        └── interactive-texas-data-centers-map/
            ├── data-centers.json
            ├── regions.json
            └── market-segments.json
```

### 2. Create Data Files

Prepare the JSON data files based on the data model specification:

- Extract data center information from the blog post
- Define region boundaries and statistics
- Create market segment definitions

Place these files in the appropriate public directory.

### 3. Implement Page Component

Create the page component at `app/apps/interactive-texas-data-centers-map/page.jsx`:

```jsx
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR for the map component
const MapWrapper = dynamic(
  () => import('@/components/mini-apps/interactive-texas-data-centers-map/MapWrapper'),
  { ssr: false }
);

// Define metadata for SEO
export const metadata = {
  title: 'Interactive Texas Data Centers Map | Texas AI Consulting',
  description: 'Explore the booming data center market across Central Texas with our interactive map visualization. Filter by region, type, and capacity to discover growth trends in Austin, San Antonio, and Waco.',
  keywords: 'data centers, Texas, Austin, San Antonio, Waco, interactive map, market analysis, hyperscale, colocation, edge computing',
  openGraph: {
    title: 'Interactive Texas Data Centers Map',
    description: 'Explore Central Texas data centers with our interactive map visualization',
    images: ['/blog-images/infographic-central-texas-data-centers.png'],
  }
};

export default function InteractiveTexasDataCentersMapPage() {
  return (
    <div className="w-full min-h-screen bg-white">
      <MapWrapper />
    </div>
  );
}
```

### 4. Implement MapWrapper Component

Create the client-side wrapper at `src/components/mini-apps/interactive-texas-data-centers-map/MapWrapper.jsx`:

```jsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import MapLayout from './MapLayout';

export default function MapWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State for data
  const [dataCenters, setDataCenters] = useState([]);
  const [regions, setRegions] = useState([]);
  const [marketSegments, setMarketSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get URL parameters
  const highlightedSection = searchParams?.get('section');
  const regionParam = searchParams?.get('region');
  const typeParam = searchParams?.get('type');
  const centerParam = searchParams?.get('center');
  const zoomParam = searchParams?.get('zoom');
  
  // State for user interactions
  const [selectedDataCenter, setSelectedDataCenter] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [filters, setFilters] = useState({
    regions: regionParam ? [regionParam] : [],
    types: typeParam ? [typeParam] : [],
    capacityRange: [0, 500],
    status: ['Operational', 'Under Construction', 'Planned']
  });
  
  // Map position state
  const [mapPosition, setMapPosition] = useState({
    coordinates: centerParam ? centerParam.split(',').map(Number) : [-97.7431, 30.2672],
    zoom: zoomParam ? Number(zoomParam) : 5
  });
  
  // Component refs for scrolling
  const componentRefs = {
    map: useRef(null),
    capacity: useRef(null),
    comparison: useRef(null),
    segmentation: useRef(null)
  };
  
  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data centers
        const dcResponse = await fetch('/data/interactive-texas-data-centers-map/data-centers.json');
        if (!dcResponse.ok) throw new Error('Failed to load data centers data');
        const dcData = await dcResponse.json();
        setDataCenters(dcData);
        
        // Fetch regions
        const regionsResponse = await fetch('/data/interactive-texas-data-centers-map/regions.json');
        if (!regionsResponse.ok) throw new Error('Failed to load regions data');
        const regionsData = await regionsResponse.json();
        setRegions(regionsData);
        
        // Fetch market segments
        const segmentsResponse = await fetch('/data/interactive-texas-data-centers-map/market-segments.json');
        if (!segmentsResponse.ok) throw new Error('Failed to load market segments data');
        const segmentsData = await segmentsResponse.json();
        setMarketSegments(segmentsData);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle section highlighting from URL
  useEffect(() => {
    if (highlightedSection && componentRefs[highlightedSection]?.current) {
      // Scroll to the highlighted section
      componentRefs[highlightedSection].current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight animation
      componentRefs[highlightedSection].current.classList.add('highlight-section');
      setTimeout(() => {
        componentRefs[highlightedSection].current.classList.remove('highlight-section');
      }, 2000);
    }
  }, [highlightedSection, componentRefs]);
  
  // Set initial region selection based on URL parameter
  useEffect(() => {
    if (regionParam && regions.length > 0) {
      const region = regions.find(r => r.id === regionParam);
      if (region) setSelectedRegion(region);
    }
  }, [regionParam, regions]);
  
  // Update URL when filters or map position changes
  const updateUrlParams = (newFilters, newRegion, newPosition) => {
    // Debounce URL updates to prevent excessive history entries
    if (updateUrlTimeout.current) clearTimeout(updateUrlTimeout.current);
    
    updateUrlTimeout.current = setTimeout(() => {
      // Create a new URLSearchParams object
      const newParams = new URLSearchParams();
      
      // Add section parameter if it exists
      if (highlightedSection) {
        newParams.set('section', highlightedSection);
      }
      
      // Add region filter if only one region is selected
      if (newFilters.regions.length === 1) {
        newParams.set('region', newFilters.regions[0]);
      }
      
      // Add type filter if only one type is selected
      if (newFilters.types.length === 1) {
        newParams.set('type', newFilters.types[0]);
      }
      
      // Add map position if it's different from default
      if (newPosition && 
          (newPosition.coordinates[0] !== -97.7431 || 
           newPosition.coordinates[1] !== 30.2672 || 
           newPosition.zoom !== 5)) {
        newParams.set('center', `${newPosition.coordinates[1]},${newPosition.coordinates[0]}`);
        newParams.set('zoom', newPosition.zoom.toString());
      }
      
      // Update the URL without refreshing the page
      router.replace(`/apps/interactive-texas-data-centers-map?${newParams.toString()}`);
    }, 500);
  };
  
  // Timeout ref for debouncing URL updates
  const updateUrlTimeout = useRef(null);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateUrlParams(newFilters, selectedRegion, mapPosition);
  };
  
  // Handle region selection
  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    
    // If a region is selected, update filters to include that region
    const newFilters = {
      ...filters,
      regions: region ? [region.id] : []
    };
    
    setFilters(newFilters);
    updateUrlParams(newFilters, region, mapPosition);
  };
  
  // Handle data center selection
  const handleDataCenterSelect = (dataCenter) => {
    setSelectedDataCenter(dataCenter);
  };
  
  // Handle map position change
  const handleMapPositionChange = (newPosition) => {
    setMapPosition(newPosition);
    updateUrlParams(filters, selectedRegion, newPosition);
  };
  
  // Filter data centers based on selected filters
  const filteredDataCenters = dataCenters.filter(dc => {
    // Region filter
    if (filters.regions.length > 0 && !filters.regions.includes(dc.region.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(dc.type.toLowerCase())) {
      return false;
    }
    
    // Capacity filter
    if (dc.capacity < filters.capacityRange[0] || dc.capacity > filters.capacityRange[1]) {
      return false;
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(dc.status)) {
      return false;
    }
    
    return true;
  });
  
  // If loading, show loading state
  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  // If error, show error state
  if (error) {
    return <div className="w-full h-screen flex items-center justify-center">
      <div className="text-red-500 text-xl">Error: {error}</div>
    </div>;
  }
  
  return (
    <MapLayout 
      dataCenters={filteredDataCenters}
      regions={regions}
      marketSegments={marketSegments}
      selectedDataCenter={selectedDataCenter}
      selectedRegion={selectedRegion}
      onSelectDataCenter={handleDataCenterSelect}
      onSelectRegion={handleRegionSelect}
      filters={filters}
      onFilterChange={handleFilterChange}
      mapPosition={mapPosition}
      onMapPositionChange={handleMapPositionChange}
      componentRefs={componentRefs}
    />
  );
}
```

### 5. Implement MapLayout Component

Create the layout component at `src/components/mini-apps/interactive-texas-data-centers-map/MapLayout.jsx`:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveMap from './charts/InteractiveMap';
import CapacityChart from './charts/CapacityChart';
import ComparisonChart from './charts/ComparisonChart';
import SegmentationChart from './charts/SegmentationChart';
import FilterControls from './FilterControls';

export default function MapLayout({
  dataCenters,
  regions,
  marketSegments,
  selectedDataCenter,
  selectedRegion,
  onSelectDataCenter,
  onSelectRegion,
  filters,
  onFilterChange,
  mapPosition,
  onMapPositionChange,
  componentRefs
}) {
  const [activeTab, setActiveTab] = useState('map');
  
  // Animation variants for tab transitions
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interactive Texas Data Centers Map
        </h1>
        <p className="text-gray-600 mb-4">
          Explore the booming data center market across Central Texas, 
          including Austin, San Antonio, and Waco.
        </p>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 mr-2 font-medium text-sm rounded-t-lg ${
              activeTab === 'map' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`px-4 py-2 mr-2 font-medium text-sm rounded-t-lg ${
              activeTab === 'capacity' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Capacity Analysis
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 mr-2 font-medium text-sm rounded-t-lg ${
              activeTab === 'comparison' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Regional Comparison
          </button>
          <button
            onClick={() => setActiveTab('segmentation')}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === 'segmentation' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Market Segmentation
          </button>
        </div>
      </header>
      
      {/* Filter Controls */}
      <div className="mb-6">
        <FilterControls 
          regions={regions}
          filters={filters}
          onFilterChange={onFilterChange}
          selectedRegion={selectedRegion}
          onSelectRegion={onSelectRegion}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
        {/* Map Tab */}
        {activeTab === 'map' && (
          <motion.div 
            ref={componentRefs.map}
            initial="hidden"
            animate="visible"
            variants={tabVariants}
            className="h-[600px]"
          >
            <InteractiveMap 
              dataCenters={dataCenters}
              regions={regions}
              selectedDataCenter={selectedDataCenter}
              selectedRegion={selectedRegion}
              onSelectDataCenter={onSelectDataCenter}
              onSelectRegion={onSelectRegion}
              position={mapPosition}
              onPositionChange={onMapPositionChange}
            />
          </motion.div>
        )}
        
        {/* Capacity Tab */}
        {activeTab === 'capacity' && (
          <motion.div 
            ref={componentRefs.capacity}
            initial="hidden"
            animate="visible"
            variants={tabVariants}
            className="h-[600px]"
          >
            <CapacityChart 
              dataCenters={dataCenters}
              filteredDataCenters={filteredDataCenters}
              regions={regions}
            />
          </motion.div>
        )}
        
        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <motion.div 
            ref={componentRefs.comparison}
            initial="hidden"
            animate="visible"
            variants={tabVariants}
            className="h-[600px]"
          >
            <ComparisonChart 
              regions={regions}
              dataCenters={filteredDataCenters}
            />
          </motion.div>
        )}
        
        {/* Segmentation Tab */}
        {activeTab === 'segmentation' && (
          <motion.div 
            ref={componentRefs.segmentation}
            initial="hidden"
            animate="visible"
            variants={tabVariants}
            className="h-[600px]"
          >
            <SegmentationChart 
              marketSegments={marketSegments}
              dataCenters={filteredDataCenters}
            />
          </motion.div>
        )}
      </div>
      
      {/* Information Panel */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        {selectedDataCenter ? (
          <div>
            <h2 className="text-xl font-bold mb-2">{selectedDataCenter.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Region:</strong> {selectedDataCenter.region}</p>
                <p><strong>Type:</strong> {selectedDataCenter.type}</p>
                <p><strong>Capacity:</strong> {selectedDataCenter.capacity} MW</p>
                <p><strong>Status:</strong> {selectedDataCenter.status}</p>
                <p><strong>Address:</strong> {selectedDataCenter.address}</p>
              </div>
              <div>
                <p><strong>Description:</strong> {selectedDataCenter.details.description}</p>
                <p><strong>Established:</strong> {selectedDataCenter.details.established}</p>
                <p><strong>Power Capacity:</strong> {selectedDataCenter.details.powerCapacity}</p>
                <p><strong>Cooling:</strong> {selectedDataCenter.details.cooling}</p>
                <p><strong>Certifications:</strong> {selectedDataCenter.details.certifications.join(', ')}</p>
                <p><strong>Expansion Plans:</strong> {selectedDataCenter.details.expansionPlans}</p>
              </div>
            </div>
          </div>
        ) : selectedRegion ? (
          <div>
            <h2 className="text-xl font-bold mb-2">{selectedRegion.name} Region</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Counties:</strong> {selectedRegion.counties.join(', ')}</p>
                <p><strong>Total Data Centers:</strong> {selectedRegion.statistics.totalDataCenters}</p>
                <p><strong>Total Capacity:</strong> {selectedRegion.statistics.totalCapacity} MW</p>
                <p><strong>Growth Rate:</strong> {selectedRegion.statistics.growthRate}%</p>
              </div>
              <div>
                <p><strong>Power Availability:</strong> {selectedRegion.statistics.powerAvailability}</p>
                <p><strong>Land Cost:</strong> ${selectedRegion.statistics.landCost}/sqft</p>
                <p><strong>Incentives:</strong></p>
                <ul className="list-disc pl-5">
                  {selectedRegion.statistics.incentives.map((incentive, index) => (
                    <li key={index}>{incentive}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Select a data center or region on the map to view detailed information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 6. Implement FilterControls Component

Create the filter controls component at `src/components/mini-apps/interactive-texas-data-centers-map/FilterControls.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function FilterControls({
  regions,
  filters,
  onFilterChange,
  selectedRegion,
  onSelectRegion
}) {
  // Local state for filters
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Handle region selection
  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    const region = regionId ? regions.find(r => r.id === regionId) : null;
    
    onSelectRegion(region);
  };
  
  // Handle type filter changes
  const handleTypeChange = (type) => {
    const newTypes = localFilters.types.includes(type)
      ? localFilters.types.filter(t => t !== type)
      : [...localFilters.types, type];
    
    handleFilterChange({
      ...localFilters,
      types: newTypes
    });
  };
  
  // Handle capacity range changes
  const handleCapacityChange = (e, index) => {
    const newRange = [...localFilters.capacityRange];
    newRange[index] = parseInt(e.target.value);
    
    handleFilterChange({
      ...localFilters,
      capacityRange: newRange
    });
  };
  
  // Handle status filter changes
  const handleStatusChange = (status) => {
    const newStatus = localFilters.status.includes(status)
      ? localFilters.status.filter(s => s !== status)
      : [...localFilters.status, status];
    
    handleFilterChange({
      ...localFilters,
      status: newStatus
    });
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    const resetFilters = {
      regions: [],
      types: [],
      capacityRange: [0, 500],
      status: ['Operational', 'Under Construction', 'Planned']
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    onSelectRegion(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filter Controls</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      <motion.div
        initial={{ height: 'auto' }}
        animate={{ height: isExpanded ? 'auto' : '40px' }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {/* Basic Filters (always visible) */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Region Filter */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              value={selectedRegion?.id || ''}
              onChange={handleRegionChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Advanced Filters (expandable) */}
        <div className={isExpanded ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            {/* Data Center Type Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Data Center Type</h3>
              <div className="space-y-2">
                {['Hyperscale', 'Colocation', 'Edge'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.types.includes(type.toLowerCase())}
                      onChange={() => handleTypeChange(type.toLowerCase())}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Capacity Range Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Capacity Range: {localFilters.capacityRange[0]} - {localFilters.capacityRange[1]} MW
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500">Min Capacity</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={localFilters.capacityRange[0]}
                    onChange={(e) => handleCapacityChange(e, 0)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Max Capacity</label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={localFilters.capacityRange[1]}
                    onChange={(e) => handleCapacityChange(e, 1)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
              <div className="space-y-2">
                {['Operational', 'Under Construction', 'Planned'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.status.includes(status)}
                      onChange={() => handleStatusChange(status)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

### 7. Implement InteractiveMap Component

Create the interactive map component at `src/components/mini-apps/interactive-texas-data-centers-map/charts/InteractiveMap.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { motion } from 'framer-motion';

// Define marker types and colors
const markerTypes = {
  'hyperscale': { color: '#4285F4', size: 12 },
  'colocation': { color: '#EA4335', size: 10 },
  'edge': { color: '#34A853', size: 8 }
};

// Define status indicators
const statusIndicators = {
  'Operational': { borderColor: '#34A853', borderWidth: 2 },
  'Under Construction': { borderColor: '#FBBC05', borderWidth: 2 },
  'Planned': { borderColor: '#4285F4', borderWidth: 2, dashArray: '2,2' }
};

export default function InteractiveMap({
  dataCenters,
  regions,
  selectedDataCenter,
  selectedRegion,
  onSelectDataCenter,
  onSelectRegion,
  position,
  onPositionChange
}) {
  // Internal state for map position if not controlled
  const [internalPosition, setInternalPosition] = useState({
    coordinates: [-99.5, 31.2],
    zoom: 5
  });
  
  // Tooltip state
  const [tooltip, setTooltip] = useState({
    show: false,
    content: null,
    position: { x: 0, y: 0 }
  });
  
  // Use position prop if provided, otherwise use internal state
  const mapPosition = position || internalPosition;
  
  // Handle zoom changes
  const handleZoomEnd = (position) => {
    // Update internal state
    setInternalPosition(position);
    
    // Notify parent if callback provided
    if (onPositionChange) {
      onPositionChange(position);
    }
  };
  
  // Handle map move
  const handleMoveEnd = (position) => {
    // Update internal state
    setInternalPosition(position);
    
    // Notify parent if callback provided
    if (onPositionChange) {
      onPositionChange(position);
    }
  };
  
  // Handle region click
  const handleRegionClick = (geo, region) => {
    // If already selected, deselect
    if (selectedRegion && selectedRegion.id === region.id) {
      onSelectRegion(null);
    } else {
      onSelectRegion(region);
    }
  };
  
  // Handle data center click
  const handleDataCenterClick = (dataCenter, evt) => {
    evt.stopPropagation(); // Prevent map click
    
    // If already selected, deselect
    if (selectedDataCenter && selectedDataCenter.id === dataCenter.id) {
      onSelectDataCenter(null);
    } else {
      onSelectDataCenter(dataCenter);
    }
  };
  
  // Show tooltip on hover
  const handleMarkerMouseEnter = (dataCenter, evt) => {
    setTooltip({
      show: true,
      content: dataCenter,
      position: { x: evt.clientX, y: evt.clientY }
    });
  };
  
  // Hide tooltip on mouse leave
  const handleMarkerMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };
  
  // Handle map background click
  const handleMapClick = () => {
    onSelectDataCenter(null);
    onSelectRegion(null);
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={() => {
            const newPosition = {
              ...mapPosition,
              zoom: Math.min(mapPosition.zoom + 1, 10)
            };
            setInternalPosition(newPosition);
            if (onPositionChange) onPositionChange(newPosition);
          }}
          className="bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center hover:bg-gray-100"
        >
          <span className="text-xl">+</span>
        </button>
        <button
          onClick={() => {
            const newPosition = {
              ...mapPosition,
              zoom: Math.max(mapPosition.zoom - 1, 1)
            };
            setInternalPosition(newPosition);
            if (onPositionChange) onPositionChange(newPosition);
          }}
          className="bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center hover:bg-gray-100"
        >
          <span className="text-xl">-</span>
        </button>
        <button
          onClick={() => {
            const defaultPosition = {
              coordinates: [-99.5, 31.2],
              zoom: 5
            };
            setInternalPosition(defaultPosition);
            if (onPositionChange) onPositionChange(defaultPosition);
          }}
          className="bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center hover:bg-gray-100"
        >
          <span className="text-sm">↺</span>
        </button>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow-md">
        <h3 className="text-xs font-bold mb-1">Legend</h3>
        <div className="space-y-1">
          {Object.entries(markerTypes).map(([type, { color }]) => (
            <div key={type} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs capitalize">{type}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 my-1"></div>
          {Object.entries(statusIndicators).map(([status, { borderColor, dashArray }]) => (
            <div key={status} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1 border-2" 
                style={{ 
                  borderColor, 
                  borderStyle: dashArray ? 'dashed' : 'solid' 
                }}
              ></div>
              <span className="text-xs">{status}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Map Container */}
      <ComposableMap
        projection="geoAlbers"
        projectionConfig={{
          scale: 4000,
          center: [-99.5, 31.2]
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
        onClick={handleMapClick}
      >
        <ZoomableGroup
          zoom={mapPosition.zoom}
          center={mapPosition.coordinates}
          onZoomEnd={handleZoomEnd}
          onMoveEnd={handleMoveEnd}
          maxZoom={10}
        >
          {/* Texas Base Map */}
          <Geographies geography="/maps/texas-map-data-v2.json">
            {({ geographies }) => geographies.map(geo => {
              // Check if this geography corresponds to one of our regions
              const region = regions.find(r => 
                r.counties.some(county => 
                  geo.properties.NAME === county
                )
              );
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => region && handleRegionClick(geo, region)}
                  style={{
                    default: {
                      fill: region 
                        ? (selectedRegion && selectedRegion.id === region.id 
                            ? '#a4cafe' // Highlighted
                            : '#e5e7eb') // Normal region
                        : '#f9fafb', // Non-region county
                      stroke: '#fff',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: region ? '#bfdbfe' : '#f9fafb',
                      stroke: '#fff',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: region ? 'pointer' : 'default'
                    },
                    pressed: {
                      fill: '#93c5fd',
                      stroke: '#fff',
                      strokeWidth: 0.5,
                      outline: 'none',
                    }
                  }}
                />
              );
            })}
          </Geographies>
          
          {/* Data Center Markers */}
          {dataCenters.map(dc => {
            const isSelected = selectedDataCenter && selectedDataCenter.id === dc.id;
            const markerStyle = markerTypes[dc.type.toLowerCase()];
            const statusStyle = statusIndicators[dc.status];
            
            return (
              <Marker
                key={dc.id}
                coordinates={dc.coordinates}
                onClick={(evt) => handleDataCenterClick(dc, evt)}
                onMouseEnter={(evt) => handleMarkerMouseEnter(dc, evt)}
                onMouseLeave={handleMarkerMouseLeave}
              >
                <motion.circle
                  cx={0}
                  cy={0}
                  r={isSelected ? markerStyle.size * 1.5 : markerStyle.size}
                  fill={markerStyle.color}
                  strokeWidth={statusStyle.borderWidth}
                  stroke={statusStyle.borderColor}
                  strokeDasharray={statusStyle.dashArray}
                  initial={{ r: markerStyle.size }}
                  animate={{ 
                    r: isSelected ? markerStyle.size * 1.5 : markerStyle.size,
                    strokeWidth: isSelected ? statusStyle.borderWidth * 1.5 : statusStyle.borderWidth
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ cursor: 'pointer' }}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Tooltip */}
      {tooltip.show && tooltip.content && (
        <div 
          className="absolute z-20 bg-white p-2 rounded shadow-lg text-sm"
          style={{
            left: tooltip.position.x + 10,
            top: tooltip.position.y + 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <h3 className="font-bold">{tooltip.content.name}</h3>
          <p>{tooltip.content.type} | {tooltip.content.capacity} MW</p>
          <p className="text-xs text-gray-500">{tooltip.content.status}</p>
        </div>
      )}
    </div>
  );
}
```

### 8. Implement Chart Components

Create the remaining chart components in the `src/components/mini-apps/interactive-texas-data-centers-map/charts/` directory. Examples include:

- `CapacityChart.jsx`: Visualizes data center capacity by region
- `ComparisonChart.jsx`: Compares data center statistics across regions
- `SegmentationChart.jsx`: Shows market segmentation data

### 9. Test and Optimize

1. Test all components for proper rendering
2. Verify data loading and filtering functionality
3. Test URL parameter handling
4. Ensure responsive design works on all screen sizes
5. Optimize performance for large datasets

## Advanced Implementation Techniques

### 1. Performance Optimization

- Implement virtualization for large datasets
- Use memoization for expensive calculations
- Lazy load chart components

```jsx
// Example of memoizing filtered data
import { useMemo } from 'react';

// Inside your component
const filteredDataCenters = useMemo(() => {
  return dataCenters.filter(dc => {
    // Filtering logic here
  });
}, [dataCenters, filters]);
```

### 2. Accessibility Enhancements

- Add ARIA attributes to interactive elements
- Ensure keyboard navigation works correctly
- Provide screen reader announcements for important changes

```jsx
// Example of keyboard accessibility in map interactions
<button
  aria-label="Zoom in"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Zoom logic
    }
  }}
>
  +
</button>
```

### 3. Animation Effects

- Add enter/exit animations for elements
- Use transitions for smooth state changes
- Implement map zooming animations

```jsx
// Example of animation with Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

### 4. Error Handling

- Implement graceful fallbacks for missing data
- Add error boundaries to prevent crashes
- Display user-friendly error messages

```jsx
// Example of error boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div className="error-container">
      <h2>Something went wrong:</h2>
      <p>{error.message}</p>
    </div>
  );
}

// In your component
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <InteractiveMap {...props} />
</ErrorBoundary>
```

## Troubleshooting Common Issues

### GeoJSON Loading Issues

If you encounter problems loading the GeoJSON data:

1. Verify the file path is correct
2. Check that the GeoJSON format is valid
3. Ensure the file is accessible from the public directory

### React-Simple-Maps Integration

Common issues with react-simple-maps:

1. SSR compatibility: Use dynamic imports with `{ ssr: false }`
2. Projection configuration: Adjust scale and center for proper map rendering
3. Marker positioning: Ensure coordinates are in the correct format [longitude, latitude]

### URL Parameter Handling

If URL parameters aren't working correctly:

1. Check that `useSearchParams` is correctly implemented
2. Verify parameter formatting and parsing
3. Ensure the router is properly configured

## Conclusion

This implementation guide provides a comprehensive approach to building the Interactive Texas Data Centers Map application. By following these steps and best practices, you can create a robust, user-friendly visualization tool that effectively communicates data center information across Central Texas.

Remember to start with the core functionality and progressively enhance the application with additional features and optimizations. Regular testing throughout the development process will help identify and address issues early, ensuring a high-quality final product.