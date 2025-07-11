# MDX Implementation Plan for TexasAI Blog

This document outlines the implementation plan for adding MDX support to the TexasAI blog, allowing React components to be embedded directly in blog posts while maintaining compatibility with existing Markdown content.

## Required Files to Create or Modify

### 1. next.config.js

Convert the existing Next.js configuration to support MDX:

```javascript
// Updated next.config.js (mjs format)
import createMDX from '@next/mdx'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig = {
  // Add pageExtensions to include md and mdx files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Keep existing config
  reactStrictMode: true,
  images: {},
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config, { isServer }) {
    // Keep existing webpack config
    if (!isServer) {
      config.externals.push('sharp')
    }
    // audio support
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve('file-loader'),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    })

    // shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })

    return config
  },
}

const withMDX = createMDX({
  // Optionally add MDX plugins here
  extension: /\.(md|mdx)$/,
})

const KEYS_TO_OMIT = ['webpackDevMiddleware', 'configOrigin', 'target', 'analyticsId', 'webpack5', 'amp', 'assetPrefix']

module.exports = (_phase, { defaultConfig }) => {
  // Add withMDX to the plugins array
  const plugins = [[withPWA], [withBundleAnalyzer, {}], [withMDX]]

  const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
    ...defaultConfig,
    ...nextConfig,
  })

  const finalConfig = {}
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key]
    }
  })

  return finalConfig
}
```

### 2. mdx-components.tsx

Create this file in the project root to define how MDX components are rendered:

```tsx
import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Customize how built-in components are rendered
    // Use your existing blog styling to maintain consistency
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold text-[#2c75ff] font-hesdeadjim"
        style={{textShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}>
        {children}
      </h1>
    ),
    a: ({ href, children }) => {
      const isInternal = href && !href.startsWith('http')
      if (isInternal) {
        return <Link href={href}>{children}</Link>
      }
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    },
    // Keep all other components as is
    ...components,
  }
}
```

### 3. lib/blog.js

Update to handle both .md and .mdx files:

```javascript
'use server';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { parseISO, compareDesc } from 'date-fns';
import { cache } from 'react';
import { sortBlogPostsByDate } from './blogUtils';

// These functions will only run on the server
const blogsDirectory = path.join(process.cwd(), 'content/blog');

/**
 * Get all blog post slugs
 */
export const getBlogSlugs = cache(async () => {
  try {
    const fileNames = fs.readdirSync(blogsDirectory);
    return fileNames.map((fileName) => {
      // Handle both .md and .mdx extensions
      return fileName.replace(/\.(md|mdx)$/, '');
    });
  } catch (error) {
    console.error('Error getting blog slugs:', error);
    return [];
  }
});

/**
 * Get blog post data by slug
 */
export const getBlogPostBySlug = cache(async (slug) => {
  try {
    // First try .md extension
    let fullPath = path.join(blogsDirectory, `${slug}.md`);
    let isMDX = false;
    
    // If .md doesn't exist, try .mdx
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(blogsDirectory, `${slug}.mdx`);
      isMDX = true;
      
      // If neither exists, return null
      if (!fs.existsSync(fullPath)) {
        return null;
      }
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      content,
      isMDX,
      title: data.title,
      date: data.date,
      author: data.author,
      excerpt: data.excerpt,
      tags: data.tags || [],
      image: data.image || null,
    };
  } catch (error) {
    console.error(`Error getting blog post ${slug}:`, error);
    return null;
  }
});

/**
 * Convert markdown to HTML (only for .md files)
 */
export const convertMarkdownToHtml = cache(async (markdown) => {
  try {
    const result = await remark()
      .use(html, { sanitize: false })
      .process(markdown);
    return result.toString();
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
});

// Keep all other existing functions unchanged
// getAllBlogPosts, getAllTags, getBlogPostsByTag
```

### 4. app/blog/[slug]/page.jsx

Update to handle MDX content:

```jsx
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts, convertMarkdownToHtml } from '../../../lib/blog';
import BlogPost from '../../../src/components/blog/BlogPost';
import { MDXRemote } from 'next-mdx-remote/serialize';

// Generate metadata for the page (keep existing implementation)
export async function generateMetadata({ params }) {
  // ...existing code...
}

// Generate static paths (keep existing implementation)
export async function generateStaticParams() {
  // ...existing code...
}

export default async function BlogPostPage({ params }) {
  try {
    const post = await getBlogPostBySlug(params.slug);
    
    if (!post) {
      console.log(`Post not found for slug: ${params.slug}`);
      notFound();
    }
    
    let contentHtml = '';
    let mdxSource = null;
    
    if (post.isMDX) {
      // For MDX content, use next-mdx-remote to serialize it
      mdxSource = await MDXRemote.serialize(post.content || '');
    } else {
      // For regular markdown, convert to HTML as before
      contentHtml = await convertMarkdownToHtml(post.content || '');
    }
    
    // Get next and previous posts for navigation
    const allPosts = await getAllBlogPosts();
    
    if (!Array.isArray(allPosts)) {
      console.error('getAllBlogPosts did not return an array:', allPosts);
      return <div>Error loading blog posts</div>;
    }
    
    const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    
    return (
      <BlogPost
        post={post}
        contentHtml={contentHtml}
        mdxSource={mdxSource}
        nextPost={nextPost}
        prevPost={prevPost}
      />
    );
  } catch (error) {
    console.error('Error rendering blog post:', error);
    notFound();
  }
}
```

### 5. src/components/blog/BlogPost.jsx

Update to handle both HTML and MDX content:

```jsx
'use client'

import BlogLayout from './BlogLayout';

export default function BlogPost({ post, contentHtml, mdxSource, nextPost, prevPost }) {
  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <div className="max-w-full">
        <BlogLayout
          post={post}
          content={contentHtml}
          mdxSource={mdxSource}
          nextPost={nextPost}
          prevPost={prevPost}
        />
      </div>
    </div>
  );
}
```

### 6. src/components/blog/BlogLayout.jsx

Update to render MDX content:

```jsx
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';
import { MDXRemote } from 'next-mdx-remote';

// LCARS decorative elements
const LCARSDecoration = ({ className = '' }) => (
  // ...existing code...
);

export default function BlogLayout({ post, content, mdxSource, nextPost, prevPost }) {
  return (
    <div className="container mx-auto px-4 py-0 max-w-4xl">
      {/* Back to blog link - keep existing code */}
      {/* Blog header - keep existing code */}
      
      {/* Blog content - update to support MDX */}
      <article className="prose prose-lg max-w-none bg-gray-900 p-6 rounded-lg dark:prose-invert prose-p:text-white prose-li:text-white prose-headings:font-bold prose-a:text-[#2c75ff] prose-img:rounded-lg overflow-visible prose-pre:overflow-x-auto prose-pre:max-w-full"
        style={{
          borderLeft: '2px solid #2c75ff',
          borderBottom: '2px solid #2c75ff',
          boxShadow: '0 0 15px rgba(44, 117, 255, 0.4)',
        }}>
        {post.isMDX && mdxSource ? (
          <MDXRemote {...mdxSource} />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="break-words"
            style={{
              maxWidth: '100%',
              overflowWrap: 'break-word',
              color: 'white'
            }}
          />
        )}
        {/* Keep existing style JSX - it still applies */}
      </article>
    </div>
  );
}
```

### 7. Sample MDX Blog Post for Testing

Create a test MDX post in content/blog/mdx-test.mdx:

```mdx
---
title: "Testing MDX Support"
slug: "mdx-test"
date: "2025-07-10"
author: "Texas AI Team"
excerpt: "This is a test post to demonstrate MDX support in our blog."
tags: ["mdx", "test", "react"]
image: "/blog-images/new-logo.png"
---

# Testing MDX Support

This is a regular markdown paragraph. You can use **bold** and *italic* text as usual.

## What is MDX?

MDX allows you to use JSX in your markdown content. This means you can import and use React components directly in your blog posts.

Here's a simple example of embedding a React component:

```jsx
function Greeting() {
  return <h3>Hello from a React component!</h3>
}

<Greeting />
```

## Regular Markdown Still Works

- List item 1
- List item 2
- List item 3

> This is a blockquote that works just like in regular Markdown.

![An image](/blog-images/new-logo.png)

## Why MDX is Powerful

MDX combines the simplicity of Markdown with the power of React components, making it perfect for technical blog posts.
```

## Additional Required Packages

To implement MDX support, you'll need to install these additional packages:

```bash
npm install next-mdx-remote
```

## Implementation Steps

1. Switch to Code mode to implement these changes
2. Update next.config.js first to support MDX
3. Create the mdx-components.tsx file
4. Update the blog.js utility file to handle both .md and .mdx files
5. Update the blog rendering components
6. Create a test MDX blog post
7. Test the implementation by viewing the test post

## Future Enhancements

Once basic MDX support is working, you can enhance it by:

1. Creating custom MDX components in src/components/mdx/
2. Adding syntax highlighting for code blocks
3. Creating interactive data visualization components
4. Adding custom UI components like tabs, accordions, and callouts