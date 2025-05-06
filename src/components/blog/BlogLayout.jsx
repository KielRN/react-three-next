'use client'

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';

export default function BlogLayout({ post, content }) {
  return (
    <div className="container mx-auto px-4 py-0 max-w-4xl">
      {/* Back to blog link */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="text-[#ebcb4c] hover:underline flex items-center font-hesdeadjim"
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
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900"></div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#ebcb4c] mb-4 font-hesdeadjim">
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
                className="px-3 py-1 bg-gray-800 text-[#ebcb4c] rounded-full text-sm hover:bg-gray-700 transition-colors font-hesdeadjim"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>
      
      {/* Blog content */}
      <article className="prose prose-lg max-w-none bg-gray-900 p-6 rounded-lg dark:prose-invert prose-p:text-white prose-li:text-white prose-headings:font-bold prose-a:text-[#ebcb4c] prose-img:rounded-lg overflow-visible prose-pre:overflow-x-auto prose-pre:max-w-full">
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="break-words"
          style={{
            maxWidth: '100%',
            overflowWrap: 'break-word',
            color: 'white'
          }}
        />
        <style jsx global>{`
          pre {
            max-width: 100%;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #1e2538 !important;
            border: 1px solid #2d3748;
            border-radius: 0.5rem;
            padding: 1.25rem;
            margin: 1.5rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .prose pre code {
            color: #f8f8f2 !important;
            font-size: 1rem !important;
          }
          
          .prose * {
            color: white !important;
          }
          
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            color: #ebcb4c !important;
            font-family: 'HesDeadJim', Arial, sans-serif !important;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .prose a {
            color: #ebcb4c !important;
            text-decoration: underline;
          }
          
          .prose p {
            margin-bottom: 1.25rem;
            line-height: 1.75;
          }
          
          .prose ul, .prose ol {
            margin-top: 1rem;
            margin-bottom: 1rem;
            margin-left: 1.5rem;
          }
          
          .prose li {
            margin-bottom: 0.5rem;
          }
          
          .prose blockquote {
            color: white !important;
            border-left-color: #ebcb4c !important;
            background-color: rgba(235, 203, 76, 0.05);
            padding: 1rem;
            margin: 1.5rem 0;
          }
          
          .prose img {
            margin: 1.5rem 0;
            border-radius: 0.5rem;
          }
        `}</style>
      </article>
    </div>
  );
}