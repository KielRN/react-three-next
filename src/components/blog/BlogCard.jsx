'use client'

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';

export default function BlogCard({ post }) {
  return (
    <div className="group rounded-lg overflow-hidden bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300"
      style={{
        borderLeft: '2px solid #2c75ff',
        borderBottom: '2px solid #2c75ff',
        boxShadow: '0 0 10px rgba(44, 117, 255, 0.4)',
        animation: 'border-pulse 3s infinite'
      }}>
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full">
          <div className="w-full h-full bg-gradient-to-r from-[#0e2042] to-gray-900" />
        </div>
        
        <div className="p-6">
          <div className="flex items-center flex-wrap gap-1 mb-3">
            {post.tags && post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-[#0e2042] text-[#ffcc00] font-hesdeadjim"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                  textShadow: '0 0 5px rgba(255, 204, 0, 0.7)'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-[#2c75ff] group-hover:text-[#ffcc00] transition-colors duration-300 font-hesdeadjim"
            style={{ textShadow: '0 0 5px rgba(44, 117, 255, 0.7)' }}>
            {post.title}
          </h2>
          
          <p className="text-sm text-gray-300 mb-4">
            {formatDate(post.date)} • {post.author}
          </p>
          
          <p className="text-white mb-4">
            {post.excerpt}
          </p>
          
          <div className="mt-2 text-right">
            <span className="inline-block px-4 py-1 text-sm text-[#ffcc00] bg-[#0e2042] font-hesdeadjim"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                textShadow: '0 0 5px rgba(255, 204, 0, 0.7)'
              }}>
              READ MORE
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}