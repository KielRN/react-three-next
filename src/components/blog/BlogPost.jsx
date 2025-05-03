'use client'

import BlogLayout from './BlogLayout';

export default function BlogPost({ post, contentHtml, nextPost, prevPost }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BlogLayout 
        post={post} 
        content={contentHtml} 
        nextPost={nextPost}
        prevPost={prevPost}
      />
    </div>
  );
}