'use client'


import Link from 'next/link';
import { useTypewriter } from '@/templates/hooks/useTypewriter';

// LCARS decoration component for the header
const LCARSHeaderDecoration = () => (
  <div className="flex items-center space-x-2 mb-6">
    <div className="h-8 w-20 bg-[#ffcc00] rounded-sm" style={{ boxShadow: '0 0 10px rgba(255, 204, 0, 0.7)' }}></div>
    <div className="h-16 w-3 bg-[#2c75ff] rounded-sm" style={{ boxShadow: '0 0 10px rgba(44, 117, 255, 0.7)' }}></div>
    <div className="h-8 w-12 bg-[#ffcc00] rounded-sm" style={{ boxShadow: '0 0 10px rgba(255, 204, 0, 0.7)' }}></div>
    <div className="h-16 w-40 bg-[#2c75ff] rounded-sm" style={{ boxShadow: '0 0 10px rgba(44, 117, 255, 0.7)' }}></div>
  </div>
);

export default function BlogHeader({ title = "Blog", description = "Explore our latest insights and tutorials" }) {
  const { displayText, isDone } = useTypewriter(title, 40, 200);

  return (
    <div className="text-white py-12" style={{
      backgroundImage: 'linear-gradient(to right, rgba(0,10,30,0.9), rgba(0,0,0,0.95))',
      borderBottom: '2px solid #2c75ff',
      boxShadow: '0 0 15px rgba(44, 117, 255, 0.5)'
    }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <LCARSHeaderDecoration />

        {/* Title with typewriter effect */}
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#2c75ff] font-hesdeadjim"
          style={{ textShadow: '0 0 10px rgba(44, 117, 255, 0.7)' }}>

          {/* SR-only full text for SEO/Accessibility */}
          <span className="sr-only">{title}</span>

          {/* Visible typewriter effect */}
          <span aria-hidden="true">
            {displayText}
            <span className={`inline-block w-3 h-7 md:h-8 bg-[#2c75ff] ml-2 mb-1 align-middle ${isDone ? 'animate-blink-slow' : 'opacity-100'}`}></span>
          </span>
        </h1>

        <p className="text-lg opacity-90 mb-6 text-gray-200">{description}</p>

        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="bg-[#0e2042] text-[#ffcc00] px-6 py-1.5 text-sm transition-colors duration-300 font-hesdeadjim uppercase tracking-wider"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
              textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
              boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)'
            }}
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-[#2c75ff] border-2 border-[#2c75ff] hover:bg-[#2c75ff]/10 px-6 py-1.5 text-sm transition-colors duration-300 font-hesdeadjim uppercase tracking-wider"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
              textShadow: '0 0 5px rgba(44, 117, 255, 0.7)',
              boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)',
              animation: 'border-pulse 3s infinite'
            }}
          >
            All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
