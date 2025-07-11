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
      isMDX,  // Flag to indicate if this is an MDX file
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
 * Get all blog posts data
 */
export const getAllBlogPosts = cache(async () => {
  try {
    const slugs = await getBlogSlugs();
    
    if (!Array.isArray(slugs)) {
      console.error('Slugs is not an array:', slugs);
      return [];
    }
    
    const postsPromises = slugs.map(slug => getBlogPostBySlug(slug));
    const posts = await Promise.all(postsPromises);
    const filteredPosts = posts.filter(post => post !== null);
    
    return sortBlogPostsByDate(filteredPosts);
  } catch (error) {
    console.error('Error getting all blog posts:', error);
    return [];
  }
});

/**
 * Convert markdown to HTML
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

/**
 * Get all unique tags from blog posts
 */
export const getAllTags = cache(async () => {
  const posts = await getAllBlogPosts();
  
  if (!Array.isArray(posts)) {
    console.error('Posts is not an array:', posts);
    return [];
  }
  
  const allTags = posts.reduce((tags, post) => {
    return [...tags, ...(post.tags || [])];
  }, []);
  
  // Get unique tags
  return [...new Set(allTags)];
});

/**
 * Get blog posts by tag
 */
export const getBlogPostsByTag = cache(async (tag) => {
  const posts = await getAllBlogPosts();
  
  if (!Array.isArray(posts)) {
    console.error('Posts is not an array:', posts);
    return [];
  }
  
  return posts.filter((post) => post.tags && post.tags.includes(tag));
});