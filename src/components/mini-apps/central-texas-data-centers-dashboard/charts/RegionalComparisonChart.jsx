'use client'

import { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

export default function RegionalComparisonChart({ data }) {
  const [selectedRegions, setSelectedRegions] = useState(['Austin', 'San Antonio', 'Waco']);

  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }

  const metrics = data.find(d => d.metrics)?.metrics || [];
  const regions = data.filter(d => d.name);

  const chartData = metrics.map(metric => {
    const entry = { factor: metric.factor };
    regions.forEach(region => {
      entry[region.name] = metric[region.name.toLowerCase().replace(' ', '')];
    });
    return entry;
  });

  const toggleRegion = (regionName) => {
    setSelectedRegions(prev => 
      prev.includes(regionName) 
        ? prev.filter(r => r !== regionName)
        : [...prev, regionName]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg h-full"
    >
      <h3 className="text-xl font-bold mb-4 text-[#ffcc00]">Regional Market Comparison</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {regions.map(region => (
          <button
            key={region.name}
            onClick={() => toggleRegion(region.name)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedRegions.includes(region.name) 
                ? 'bg-[#2c75ff] text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {region.name}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#444" />
          <PolarAngleAxis dataKey="factor" />
          <PolarRadiusAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0e2042', border: '1px solid #2c75ff' }}
            labelStyle={{ color: '#ffcc00' }}
          />
          <Legend />
          {regions.filter(r => selectedRegions.includes(r.name)).map((region) => (
            <Radar
              key={region.name}
              name={region.name}
              dataKey={region.name}
              stroke={region.color}
              fill={region.color}
              fillOpacity={0.6}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}