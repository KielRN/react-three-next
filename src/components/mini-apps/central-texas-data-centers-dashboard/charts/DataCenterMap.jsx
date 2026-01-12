'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Convert lat/lon to SVG coordinates with proper aspect ratio
function projectToSVG(lon, lat, bounds, width, height, padding = 20) {
  const lonRange = bounds.maxLon - bounds.minLon;
  const latRange = bounds.maxLat - bounds.minLat;

  // Calculate aspect ratio to maintain proper shape
  const targetWidth = width - 2 * padding;
  const targetHeight = height - 2 * padding;
  const geoAspect = lonRange / latRange;
  const svgAspect = targetWidth / targetHeight;

  let effectiveWidth = targetWidth;
  let effectiveHeight = targetHeight;
  let offsetX = padding;
  let offsetY = padding;

  // Adjust to maintain aspect ratio
  if (geoAspect > svgAspect) {
    // Geography is wider - fit to width
    effectiveHeight = targetWidth / geoAspect;
    offsetY = padding + (targetHeight - effectiveHeight) / 2;
  } else {
    // Geography is taller - fit to height
    effectiveWidth = targetHeight * geoAspect;
    offsetX = padding + (targetWidth - effectiveWidth) / 2;
  }

  const x = ((lon - bounds.minLon) / lonRange) * effectiveWidth + offsetX;
  const y = ((bounds.maxLat - lat) / latRange) * effectiveHeight + offsetY;

  return { x, y };
}

// Define data centers with verified lat/lon coordinates from research
const dataCenters = [
  { name: "Microsoft Castroville", region: "San Antonio", lat: 29.3530, lon: -98.8750, size: 12 },
  { name: "CyrusOne SAT1", region: "San Antonio", lat: 29.5030, lon: -98.7125, size: 10 },
  { name: "Switch Austin", region: "Austin", lat: 30.1850, lon: -97.7050, size: 12 },
  { name: "Digital Realty", region: "Austin", lat: 30.2672, lon: -97.7431, size: 10 },
  { name: "Meta Temple", region: "Temple/Waco", lat: 31.1410, lon: -97.3522, size: 14 },
  { name: "DataBank Waco", region: "Waco", lat: 31.5593, lon: -97.1418, size: 8 },
];

// Major cities with verified accurate coordinates from research
const cities = [
  { name: "Austin", lat: 30.2672, lon: -97.7431 },
  { name: "San Antonio", lat: 29.4241, lon: -98.4936 },
  { name: "Waco", lat: 31.5493, lon: -97.1467 },
  { name: "Dallas", lat: 32.7831, lon: -96.8067 },
  { name: "Houston", lat: 29.7604, lon: -95.3698 },
  { name: "El Paso", lat: 31.7587, lon: -106.4869 },
  { name: "Temple", lat: 31.0982, lon: -97.3428 },
];

// Map regions with labels
const regions = [
  { name: "West Texas", lat: 31.5, lon: -104 },
  { name: "North Texas", lat: 33.5, lon: -97 },
  { name: "East Texas", lat: 31.5, lon: -94.5 },
  { name: "Central Texas", lat: 30.5, lon: -98 },
  { name: "South Texas", lat: 27.5, lon: -98 },
];

export default function DataCenterMap() {
  const [texasPath, setTexasPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const SVG_WIDTH = 600;
  const SVG_HEIGHT = 500;
  const PADDING = 30;

  useEffect(() => {
    // Load and process GeoJSON
    fetch('/apps/central-texas-data-centers/texas.geojson')
      .then(res => res.json())
      .then(data => {
        console.log('GeoJSON loaded:', data.geometry.type);
        const coordinates = data.geometry.coordinates;
        console.log('Number of polygons:', coordinates.length);

        // Calculate actual bounds from the GeoJSON data
        let minLon = Infinity, maxLon = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;

        coordinates.forEach((polygon) => {
          polygon.forEach((ring) => {
            ring.forEach((point) => {
              const [lon, lat] = point;
              minLon = Math.min(minLon, lon);
              maxLon = Math.max(maxLon, lon);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
            });
          });
        });

        const calculatedBounds = { minLon, maxLon, minLat, maxLat };
        console.log('Calculated bounds:', calculatedBounds);
        setBounds(calculatedBounds);

        let pathData = '';

        // GeoJSON MultiPolygon structure: [[[ring1], [ring2]], [[ring3]]]
        coordinates.forEach((polygon) => {
          polygon.forEach((ring) => {
            ring.forEach((point, pointIndex) => {
              const [lon, lat] = point;
              const { x, y } = projectToSVG(lon, lat, calculatedBounds, SVG_WIDTH, SVG_HEIGHT, PADDING);

              if (pointIndex === 0) {
                pathData += `M ${x},${y} `;
              } else {
                pathData += `L ${x},${y} `;
              }
            });
            pathData += 'Z ';
          });
        });

        console.log('Path data length:', pathData.length);
        console.log('Sample city positions:');
        console.log('Dallas:', projectToSVG(-96.8067, 32.7831, calculatedBounds, SVG_WIDTH, SVG_HEIGHT, PADDING));
        console.log('Houston:', projectToSVG(-95.3698, 29.7604, calculatedBounds, SVG_WIDTH, SVG_HEIGHT, PADDING));
        console.log('Austin:', projectToSVG(-97.7431, 30.2672, calculatedBounds, SVG_WIDTH, SVG_HEIGHT, PADDING));
        setTexasPath(pathData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading GeoJSON:', err);
        setIsLoading(false);
      });
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 5);
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#ffcc00]">Data Center Locations</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setZoom(Math.min(5, zoom * 1.2))}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom / 1.2))}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
            title="Reset View"
          >
            ↺
          </button>
        </div>
      </div>
      <div
        className="relative w-full overflow-hidden rounded"
        style={{ height: "500px", cursor: isDragging ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading || !bounds ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading map...
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(44, 117, 255, 0.3))',
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Add a decorative grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2c75ff" strokeWidth="0.2" opacity="0.3" />
              </pattern>
            </defs>
            <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#grid)" opacity="0.2" />

            {/* Texas outline from GeoJSON */}
            {texasPath && (
              <path
                d={texasPath}
                fill="#1a2332"
                stroke="#2c75ff"
                strokeWidth="3"
                className="opacity-100"
                fillRule="evenodd"
              />
            )}

            {/* Region labels */}
            {regions.map(region => {
              const { x, y } = projectToSVG(region.lon, region.lat, bounds, SVG_WIDTH, SVG_HEIGHT, PADDING);
              return (
                <text
                  key={region.name}
                  x={x}
                  y={y}
                  fontSize="12"
                  fill="#8b8b8b"
                  textAnchor="middle"
                  className="font-semibold pointer-events-none"
                >
                  {region.name}
                </text>
              );
            })}

            {/* Major cities */}
            {cities.map(city => {
              const { x, y } = projectToSVG(city.lon, city.lat, bounds, SVG_WIDTH, SVG_HEIGHT, PADDING);
              return (
                <g key={city.name}>
                  <circle cx={x} cy={y} r="4" fill="#ffffff" opacity="0.3" />
                  <text
                    x={x}
                    y={y - 8}
                    fontSize="10"
                    fill="#8b8b8b"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}

            {/* Data center markers */}
            {dataCenters.map((dc) => {
              const { x, y } = projectToSVG(dc.lon, dc.lat, bounds, SVG_WIDTH, SVG_HEIGHT, PADDING);
              return (
                <g key={dc.name}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={dc.size}
                    fill="#ffcc00"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    initial={{ r: 0 }}
                    animate={{ r: dc.size }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255, 204, 0, 0.5))' }}
                  />
                  <text
                    x={x}
                    y={y - dc.size - 5}
                    fontSize="9"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontWeight="bold"
                    className="pointer-events-none"
                    style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                  >
                    {dc.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Controls Info and Legend */}
      <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
        <div className="text-gray-500">
          💡 Scroll to zoom • Drag to pan
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#ffcc00] mr-1"></div>
            <span>Data Center</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-white opacity-30 mr-1"></div>
            <span>Major City</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}