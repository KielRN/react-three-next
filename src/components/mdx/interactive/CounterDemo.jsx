'use client'

import { useState } from 'react';

export function CounterDemo() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4 my-6 bg-[#0e2042] rounded-lg border border-[#2c75ff]">
      <h3 className="text-xl text-[#ffcc00] mb-4 font-hesdeadjim">
        Interactive Counter
      </h3>
      <p className="text-white mb-4">
        This component demonstrates interactive elements in MDX. 
        Count: <span className="text-[#2c75ff] font-bold">{count}</span>
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-[#2c75ff] text-white rounded"
      >
        Increment
      </button>
    </div>
  );
}