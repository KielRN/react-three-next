'use client'

import BlogLayout from './BlogLayout';

export default function BlogPost({ post, contentHtml, mdxContent, nextPost, prevPost }) {
  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <div className="max-w-full">
        <BlogLayout
          post={post}
          contentHtml={contentHtml}
          mdxContent={mdxContent}
          nextPost={nextPost}
          prevPost={prevPost}
        />
      </div>
    </div>
  );
}