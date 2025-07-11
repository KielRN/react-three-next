'use client'

import GaugeChart from 'react-gauge-chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function ForecastGauges({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg h-full"
    >
      <h3 className="text-xl font-bold mb-4 text-[#ffcc00]">2028 Market Forecast</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-center">Total Capacity Growth</h4>
          <GaugeChart
            id="capacity-gauge"
            nrOfLevels={5}
            colors={["#ffcc00", "#2c75ff"]}
            arcWidth={0.3}
            percent={data.capacityGrowth / 1000} // Assuming max growth is 1000% for visualization
            textColor="#ffffff"
            formatTextValue={value => `${data.capacityGrowth}%`}
          />
        </div>
        <div>
          <h4 className="text-center">Investment Volume</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={[data.investment]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0e2042', border: '1px solid #2c75ff' }}
                formatter={(value) => [`$${value} Billion`, 'Investment']}
              />
              <Bar dataKey="value" fill="#2c75ff">
                <Cell fill="#2c75ff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="text-center">Land Development</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={[data.landDevelopment]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0e2042', border: '1px solid #2c75ff' }}
                formatter={(value) => [`${value} Acres`, 'Land']}
              />
              <Bar dataKey="value" fill="#ffcc00">
                <Cell fill="#ffcc00" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-center">Job Creation</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={[data.jobCreation]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0e2042', border: '1px solid #2c75ff' }}
                formatter={(value) => [`${value}+`, 'Jobs']}
              />
              <Bar dataKey="value" fill="#ff6c00">
                <Cell fill="#ff6c00" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}