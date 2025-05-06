'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Custom LCARS-style decorative element
const LCARSDecoration = () => (
  <div className="hidden md:flex items-center space-x-1 mr-2">
    <div className="h-6 w-2 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
    <div className="h-10 w-1 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}></div>
    <div className="h-4 w-3 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
  </div>
);

// Star Trek-inspired pulse animation as CSS
const pulseAnimation = `
  @keyframes lcars-pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
  }
  
  @keyframes border-pulse {
    0% { box-shadow: 0 0 5px rgba(44, 117, 255, 0.4); }
    50% { box-shadow: 0 0 15px rgba(44, 117, 255, 0.7); }
    100% { box-shadow: 0 0 5px rgba(44, 117, 255, 0.4); }
  }
`;

export default function Navigation() {
  // Add a style tag for the animations
  useEffect(() => {
    // Create style element if it doesn't exist
    if (!document.getElementById('lcars-animations')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'lcars-animations';
      styleEl.textContent = pulseAnimation;
      document.head.appendChild(styleEl);
      
      // Clean up
      return () => {
        const element = document.getElementById('lcars-animations');
        if (element) element.remove();
      };
    }
  }, []);
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    // Add other navigation links as needed
  ]

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black shadow-lg py-3' : 'bg-black bg-opacity-90 py-6'
      }`}
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(0,10,30,0.9), rgba(0,0,0,0.95))',
        borderBottom: '2px solid #2c75ff',
        boxShadow: '0 0 15px rgba(44, 117, 255, 0.5)'
      }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="p-2 bg-black bg-opacity-50 rounded-lg border-l-2 border-t-2 border-[#2c75ff] shadow-lg"
               style={{
                 boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)',
                 animation: 'border-pulse 3s infinite'
               }}>
            <img src="/img/New-Texas-AI-Logo-V2-Full-Large.png" alt="Texas AI Consulting Logo" className="h-24 w-auto" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <LCARSDecoration />
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`relative font-medium transition-all duration-300 font-hesdeadjim text-lg uppercase tracking-wider px-4 py-2 ${
                pathname === link.path
                  ? 'text-[#2c75ff] bg-[#0e2042] border-b-2 border-[#2c75ff]'
                  : 'text-[#ffcc00] hover:text-[#2c75ff] hover:bg-[#0e2042] hover:border-b-2 hover:border-[#2c75ff]'
              }`}
              style={{
                clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                textShadow: pathname === link.path ? '0 0 5px rgba(44, 117, 255, 0.7)' : '0 0 5px rgba(255, 204, 0, 0.7)'
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden bg-black border border-[#2c75ff] rounded p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            boxShadow: '0 0 8px rgba(44, 117, 255, 0.6)',
            animation: 'border-pulse 3s infinite'
          }}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ffcc00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#2c75ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black bg-opacity-95 shadow-lg border-t border-[#2c75ff]"
             style={{
               backgroundImage: 'linear-gradient(to bottom, rgba(0,10,30,0.9), rgba(0,0,0,0.98))',
               boxShadow: 'inset 0 0 15px rgba(44, 117, 255, 0.3)'
             }}>
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`font-medium block py-3 px-4 font-hesdeadjim uppercase tracking-wide text-center transition-all duration-300 ${
                  pathname === link.path
                    ? 'text-[#2c75ff] bg-[#0e2042] border-l-2 border-[#2c75ff]'
                    : 'text-[#ffcc00] hover:text-[#2c75ff] hover:bg-[#0e2042] hover:border-l-2 hover:border-[#2c75ff]'
                }`}
                style={{
                  textShadow: pathname === link.path ? '0 0 5px rgba(44, 117, 255, 0.7)' : '0 0 5px rgba(255, 204, 0, 0.7)'
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}