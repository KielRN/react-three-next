'use client'

import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function MarketCapacityChart({ data }) {
  const [filterYear, setFilterYear] = useState(2028);

  if (!data || data.length === 0) {
    return <div>Loading...</div>;
  }

  const filteredData = data.filter(item => item.year <= filterYear);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg"
    >
      <h3 className="text-xl font-bold mb-4 text-[#ffcc00]">Data Center Capacity Growth (MW)</h3>
      <div className="mb-4">
        <label htmlFor="year-filter" className="mr-2">View up to year:</label>
        <select
          id="year-filter"
          value={filterYear}
          onChange={(e) => setFilterYear(parseInt(e.target.value))}
          className="bg-gray-700 text-white rounded p-1"
        >
          {data.map(item => <option key={item.year} value={item.year}>{item.year}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0e2042', border: '1px solid #2c75ff' }}
            labelStyle={{ color: '#ffcc00' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="operational" 
            stackId="1"
            stroke="#2c75ff" 
            fill="#2c75ff" 
            fillOpacity={0.8}
            name="Operational"
          />
          <Area 
            type="monotone" 
            dataKey="underConstruction" 
            stackId="1"
            stroke="#ffcc00" 
            fill="#ffcc00" 
            fillOpacity={0.6}
            name="Under Construction"
          />
          <Area 
            type="monotone" 
            dataKey="planned" 
            stackId="1"
            stroke="#ff6c00" 
            fill="#ff6c00" 
            fillOpacity={0.4}
            name="Planned"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}