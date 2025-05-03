'use client'

import { Suspense } from 'react';
import BlogCard from './BlogCard';
import TagsList from './TagsList';

export default function BlogList({ posts, allTags, activeTag }) {
  return (
    <>
      {/* Tags filter */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Filter by topic
        </h2>
        <TagsList tags={allTags} activeTag={activeTag} />
      </div>
      
      {/* Blog posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Suspense key={post.slug} fallback={<div className="h-80 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
              <BlogCard post={post} />
            </Suspense>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              No posts found
            </h3>
            {activeTag && (
              <p className="text-gray-600 dark:text-gray-400">
                No posts found with the tag: <span className="font-semibold">{activeTag}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}