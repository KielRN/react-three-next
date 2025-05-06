'use client'

import BlogLayout from './BlogLayout';

export default function BlogPost({ post, contentHtml, nextPost, prevPost }) {
  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <div className="max-w-full">
        <BlogLayout
          post={post}
          content={contentHtml}
          nextPost={nextPost}
          prevPost={prevPost}
        />
      </div>
    </div>
  );
}