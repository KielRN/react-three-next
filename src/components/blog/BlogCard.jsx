'use client'

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';

export default function BlogCard({ post }) {
  return (
    <div className="group rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full">
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-1 mb-2">
            {post.tags && post.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {post.title}
          </h2>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {formatDate(post.date)} • {post.author}
          </p>
          
          <p className="text-gray-700 dark:text-gray-300">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </div>
  );
}