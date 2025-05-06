'use client'

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';

export default function BlogCard({ post }) {
  return (
    <div className="group rounded-lg overflow-hidden bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full">
          <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900" />
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-1 mb-2">
            {post.tags && post.tags.map((tag) => (
              <span 
                key={tag}
                className="px-2 py-1 text-xs bg-gray-900 text-[#ebcb4c] rounded-full font-hesdeadjim"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-[#ebcb4c] group-hover:text-[#ebcb4c]/80 transition-colors duration-200 font-hesdeadjim">
            {post.title}
          </h2>
          
          <p className="text-sm text-gray-400 mb-4">
            {formatDate(post.date)} • {post.author}
          </p>
          
          <p className="text-white">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </div>
  );
}