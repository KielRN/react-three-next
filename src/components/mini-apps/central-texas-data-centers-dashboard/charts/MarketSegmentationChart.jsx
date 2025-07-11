'use client'

import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function MarketSegmentationChart({ data }) {
  const [year, setYear] = useState(2024);

  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }

  const yearData = data.find(item => item.year === year) || data[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg h-full"
    >
      <h3 className="text-xl font-bold mb-4 text-[#ffcc00]">Market Segmentation {year}</h3>
      <div className="mb-4">
        <label htmlFor="year-segment-filter" className="mr-2">Year:</label>
        <select
          id="year-segment-filter"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="bg-gray-700 text-white rounded p-1"
        >
          {data.map(item => <option key={item.year} value={item.year}>{item.year}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={yearData.segments}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {yearData.segments.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} MW`, 'Capacity']}
            contentStyle={{ backgroundColor: '#0e2042', border: '1px solid #2c75ff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}