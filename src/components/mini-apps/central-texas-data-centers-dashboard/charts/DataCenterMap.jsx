'use client'

import React from 'react';
import { motion } from 'framer-motion';

// Define data centers with coordinates optimized for our SVG viewport
const dataCenters = [
  { name: "Microsoft Castroville", region: "San Antonio", x: 135, y: 370, size: 12 },
  { name: "CyrusOne", region: "San Antonio", x: 150, y: 350, size: 10 },
  { name: "Switch SuperNAP", region: "Austin", x: 220, y: 280, size: 12 },
  { name: "Digital Realty", region: "Austin", x: 225, y: 260, size: 10 },
  { name: "Meta Temple", region: "Waco", x: 240, y: 190, size: 14 },
  { name: "DataBank", region: "Waco", x: 250, y: 170, size: 8 },
];

// Map regions with labels
const regions = [
  { name: "West Texas", x: 90, y: 250 },
  { name: "North Texas", x: 240, y: 120 },
  { name: "East Texas", x: 330, y: 230 },
  { name: "Central Texas", x: 230, y: 230 },
  { name: "South Texas", x: 180, y: 400 },
];

export default function DataCenterMap() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg"
    >
      <h3 className="text-xl font-bold mb-4 text-[#ffcc00]">Data Center Locations</h3>
      <div className="relative w-full" style={{ height: "400px" }}>
        <svg 
          viewBox="0 0 400 450" 
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 6px rgba(44, 117, 255, 0.3))' }}
        >
          {/* Texas outline */}
          <path
            d="M56,165 L107,165 L107,96 L240,96 L240,66 L363,66 L363,165 L339,190 L339,272 
               L314,297 L314,346 L265,379 L240,379 L240,405 L190,405 L165,346 L140,346 L107,313 
               L74,313 L56,272 L31,272 L31,222 L56,190 Z"
            fill="#0e2042"
            stroke="#2c75ff"
            strokeWidth="2"
            className="opacity-90"
          />
          
          {/* Region labels */}
          {regions.map(region => (
            <text
              key={region.name}
              x={region.x}
              y={region.y}
              fontSize="12"
              fill="#8b8b8b"
              textAnchor="middle"
              className="font-semibold"
            >
              {region.name}
            </text>
          ))}
          
          {/* Major cities dots */}
          <circle cx="225" cy="270" r="4" fill="#ffffff" opacity="0.3" />
          <text x="225" cy="255" fontSize="10" fill="#8b8b8b" textAnchor="middle">Austin</text>
          
          <circle cx="140" cy="360" r="4" fill="#ffffff" opacity="0.3" />
          <text x="140" cy="345" fontSize="10" fill="#8b8b8b" textAnchor="middle">San Antonio</text>
          
          <circle cx="245" cy="180" r="4" fill="#ffffff" opacity="0.3" />
          <text x="245" cy="165" fontSize="10" fill="#8b8b8b" textAnchor="middle">Waco</text>
          
          <circle cx="300" cy="120" r="4" fill="#ffffff" opacity="0.3" />
          <text x="300" cy="105" fontSize="10" fill="#8b8b8b" textAnchor="middle">Dallas</text>
          
          <circle cx="130" cy="120" r="4" fill="#ffffff" opacity="0.3" />
          <text x="130" cy="105" fontSize="10" fill="#8b8b8b" textAnchor="middle">Amarillo</text>
          
          <circle cx="60" cy="230" r="4" fill="#ffffff" opacity="0.3" />
          <text x="60" cy="215" fontSize="10" fill="#8b8b8b" textAnchor="middle">El Paso</text>
          
          <circle cx="190" cy="390" r="4" fill="#ffffff" opacity="0.3" />
          <text x="190" cy="405" fontSize="10" fill="#8b8b8b" textAnchor="middle">Corpus Christi</text>
          
          {/* Data center markers */}
          {dataCenters.map((dc) => (
            <g key={dc.name}>
              <motion.circle
                cx={dc.x}
                cy={dc.y}
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
                x={dc.x}
                y={dc.y - dc.size - 5}
                fontSize="9"
                fill="#ffffff"
                textAnchor="middle"
                fontWeight="bold"
                style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
              >
                {dc.name}
              </text>
            </g>
          ))}
          
          {/* Add a decorative grid */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2c75ff" strokeWidth="0.2" opacity="0.3" />
          </pattern>
          <rect width="400" height="450" fill="url(#grid)" opacity="0.2" />
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-3 text-xs text-gray-400 flex justify-end items-center">
        <div className="mr-4 flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#ffcc00] mr-1"></div>
          <span>Data Center</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-white opacity-30 mr-1"></div>
          <span>Major City</span>
        </div>
      </div>
    </motion.div>
  );
}