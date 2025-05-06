'use client'

import Link from 'next/link';

export default function BlogHeader({ title = "Blog", description = "Explore our latest insights and tutorials" }) {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#ebcb4c] font-hesdeadjim">{title}</h1>
        <p className="text-xl opacity-90 mb-8">{description}</p>
        
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="bg-gray-900 text-[#ebcb4c] hover:bg-gray-800 px-6 py-2 rounded-lg transition-colors duration-200 font-hesdeadjim"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-[#ebcb4c] border border-[#ebcb4c] hover:bg-[#ebcb4c]/10 px-6 py-2 rounded-lg transition-colors duration-200 font-hesdeadjim"
          >
            All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}