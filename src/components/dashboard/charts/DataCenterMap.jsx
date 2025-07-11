'use client'

import React from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'framer-motion';

const dataCenters = [
    { name: "Microsoft Castroville", region: "San Antonio", coordinates: [-98.8750, 29.3555], size: 100 },
    { name: "CyrusOne", region: "San Antonio", coordinates: [-98.6889, 29.5325], size: 50 },
    { name: "Switch SuperNAP", region: "Austin", coordinates: [-97.7431, 30.2672], size: 80 },
    { name: "Digital Realty", region: "Austin", coordinates: [-97.6978, 30.3824], size: 60 },
    { name: "Meta Temple", region: "Waco", coordinates: [-97.3428, 31.0982], size: 120 },
    { name: "DataBank", region: "Waco", coordinates: [-97.1331, 31.5493], size: 20 },
];

export default function DataCenterMap({ data }) {
  if (!data) {
    return <div>Loading Map...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg"
    >
      <h3 className="text-xl font-bold mb-4 text-[#ffcc00]">Data Center Locations</h3>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 4000,
          center: [-99.5, 31.2] // Center of Texas
        }}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup>
          <Geographies geography={data}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0e2042"
                  stroke="#2c75ff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1a3366", outline: "none" },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>
          
          {dataCenters.map(({ name, coordinates, size }) => (
            <Marker key={name} coordinates={coordinates}>
              <circle
                r={Math.sqrt(size) / 2}
                fill="#ffcc00"
                stroke="#FFFFFF"
                strokeWidth={0.5}
              />
              <text
                textAnchor="middle"
                y={-10}
                style={{ 
                  fontFamily: "system-ui", 
                  fill: "#FFFFFF",
                  fontSize: "8px"
                }}
              >
                {name}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </motion.div>
  );
}