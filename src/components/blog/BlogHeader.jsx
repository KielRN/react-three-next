'use client'

import Link from 'next/link';

export default function BlogHeader({ title = "Blog", description = "Explore our latest insights and tutorials" }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl opacity-90 mb-8">{description}</p>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Home
          </Link>
          <Link 
            href="/blog" 
            className="text-white border border-white hover:bg-white/10 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}