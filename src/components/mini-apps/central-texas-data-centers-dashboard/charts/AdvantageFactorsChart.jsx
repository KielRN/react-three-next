'use client'

import { motion } from 'framer-motion';

const factors = [
  { name: 'Strategic Land Resources', score: 9 },
  { name: 'Power Infrastructure', score: 8 },
  { name: 'Business-Friendly Climate', score: 10 },
  { name: 'Connectivity Infrastructure', score: 8 },
  { name: 'Tech Ecosystem & Talent', score: 9 },
];

const FactorBar = ({ name, score }) => {
  const width = `${score * 10}%`;
  return (
    <div className="mb-2">
      <p className="text-sm">{name}</p>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <motion.div
          className="bg-gradient-to-r from-[#2c75ff] to-[#ffcc00] h-4 rounded-full"
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default function AdvantageFactorsChart() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-4 rounded-lg h-full"
    >
      <h3 className="text-xl font-bold mb-4 text-[#ffcc00]">Texas's Data Center Advantage</h3>
      <div>
        {factors.map(factor => (
          <FactorBar key={factor.name} {...factor} />
        ))}
      </div>
    </motion.div>
  );
}