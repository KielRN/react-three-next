'use client'

import { Suspense, useState } from 'react';
import BlogCard from './BlogCard';
import TagsList from './TagsList';

// LCARS decoration component for section headers
const LCARSSectionHeader = ({ title }) => (
  <div className="flex items-center mb-4">
    <div className="flex items-center mr-3">
      <div className="h-8 w-3 bg-ai-blue rounded-sm shadow-[0_0_5px_rgba(44,117,255,0.7)]"></div>
      <div className="h-6 w-8 bg-ai-gold-bright rounded-sm ml-1 shadow-[0_0_5px_rgba(255,204,0,0.7)]"></div>
    </div>
    <h2 className="text-xl font-semibold text-ai-blue font-hesdeadjim drop-shadow-[0_0_5px_rgba(44,117,255,0.7)]">
      {title}
    </h2>
  </div>
);

export default function BlogList({ posts, allTags, activeTag }) {
  // Posts are already sorted newest-first by sortBlogPostsByDate
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="relative">
      {/* Collapsible Tags filter */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 text-sm font-semibold text-ai-blue hover:text-ai-gold transition-colors font-hesdeadjim mb-2"
        >
          <span className={`transform transition-transform ${showFilter ? 'rotate-90' : ''}`}>▶</span>
          {showFilter ? 'HIDE FILTERS' : 'SHOW FILTERS'}
          {activeTag && <span className="text-ai-gold text-xs">({activeTag})</span>}
        </button>

        {showFilter && (
          <div className="pl-6 pt-2 pb-3 border-l-2 border-ai-blue/30">
            <TagsList tags={allTags} activeTag={activeTag} />
          </div>
        )}
      </div>

      {/* Blog posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Suspense key={post.slug} fallback={
              <div className="h-80 bg-ai-navy animate-pulse rounded-lg border-l border-b border-ai-blue shadow-[0_0_10px_rgba(44,117,255,0.3)]"></div>
            }>
              <BlogCard post={post} />
            </Suspense>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-l-2 border-ai-blue shadow-[0_0_15px_rgba(44,117,255,0.3)] bg-gradient-to-r from-ai-navy/40 to-transparent">
            <h3 className="text-2xl font-semibold text-ai-blue mb-4 font-hesdeadjim drop-shadow-[0_0_8px_rgba(44,117,255,0.7)]">
              No posts found
            </h3>
            {activeTag && (
              <p className="text-gray-300">
                No posts found with the tag: <span className="font-semibold text-ai-gold font-hesdeadjim drop-shadow-[0_0_5px_rgba(255,204,0,0.7)]">{activeTag}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}