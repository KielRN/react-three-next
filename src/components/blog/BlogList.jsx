'use client'

import { Suspense } from 'react';
import BlogCard from './BlogCard';
import TagsList from './TagsList';

// LCARS decoration component for section headers
const LCARSSectionHeader = ({ title }) => (
  <div className="flex items-center mb-4">
    <div className="flex items-center mr-3">
      <div className="h-8 w-3 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}></div>
      <div className="h-6 w-8 bg-[#ffcc00] rounded-sm ml-1" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
    </div>
    <h2 className="text-xl font-semibold text-[#2c75ff] font-hesdeadjim"
      style={{textShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}>
      {title}
    </h2>
  </div>
);

export default function BlogList({ posts, allTags, activeTag }) {
  return (
    <div className="relative" style={{
      background: 'linear-gradient(to bottom, rgba(0,10,30,0.3), rgba(0,0,0,0))',
      boxShadow: 'inset 0 3px 10px rgba(44, 117, 255, 0.2)',
    }}>
      {/* Tags filter */}
      <div className="mb-10 p-6 border-l-2 border-[#2c75ff]" style={{
        boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)',
      }}>
        <LCARSSectionHeader title="Filter by topic" />
        <TagsList tags={allTags} activeTag={activeTag} />
      </div>
      
      {/* Blog posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Suspense key={post.slug} fallback={
              <div className="h-80 bg-[#0e2042] animate-pulse rounded-lg border-l border-b border-[#2c75ff]"
                  style={{boxShadow: '0 0 10px rgba(44, 117, 255, 0.3)'}}></div>
            }>
              <BlogCard post={post} />
            </Suspense>
          ))
        ) : (
          <div className="col-span-full py-12 text-center" style={{
            borderLeft: '2px solid #2c75ff',
            boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)',
            background: 'linear-gradient(to right, rgba(14,32,66,0.4), rgba(0,0,0,0.2))'
          }}>
            <h3 className="text-2xl font-semibold text-[#2c75ff] mb-4 font-hesdeadjim"
              style={{textShadow: '0 0 8px rgba(44, 117, 255, 0.7)'}}>
              No posts found
            </h3>
            {activeTag && (
              <p className="text-gray-300">
                No posts found with the tag: <span className="font-semibold text-[#ffcc00] font-hesdeadjim"
                style={{textShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}>{activeTag}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}