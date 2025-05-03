'use client'

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';

export default function BlogLayout({ post, content }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back to blog link */}
      <div className="mb-8">
        <Link 
          href="/blog" 
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to Blog
        </Link>
      </div>
      
      {/* Blog header */}
      <header className="mb-8">
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>
        
        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
          <span>{formatDate(post.date)}</span>
          <span className="mx-2">•</span>
          <span>{post.author}</span>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link 
                key={tag} 
                href={`/blog?tag=${tag}`} 
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>
      
      {/* Blog content */}
      <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  );
}