import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts, convertMarkdownToHtml } from '../../../lib/blog';
import BlogPost from '../../../src/components/blog/BlogPost';
import { serialize } from 'next-mdx-remote/serialize';

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }
  
  return {
    title: `${post.title} | Texas AI Consulting Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://texasai.consulting/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [{ url: post.image }] : [],
    },
  };
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }) {
  console.log('BlogPostPage called with slug:', params.slug);
  try {
    console.log('About to call getBlogPostBySlug...');
    const post = await getBlogPostBySlug(params.slug);
    console.log('getBlogPostBySlug returned:', post ? 'data' : 'null');
    
    if (!post) {
      console.log(`Post not found for slug: ${params.slug}`);
      notFound();
    }
    
    // Debug the post content
    console.log('BlogPostPage - Post received:', {
      slug: post.slug,
      isMDX: post.isMDX,
      hasContent: !!post.content,
      contentLength: post.content?.length || 0,
      contentPreview: post.content?.substring(0, 200) || 'NO CONTENT',
      postKeys: Object.keys(post),
      contentType: typeof post.content,
      contentTrimmed: post.content?.trim().length || 0
    });

    let contentHtml = '';
    let mdxSource = null;
    
    if (post.isMDX) {
      // For MDX content, serialize it for next-mdx-remote
      try {
        console.log('Attempting to serialize MDX content, length:', post.content?.length);
        if (!post.content || post.content.trim() === '') {
          throw new Error('No content to serialize');
        }
        mdxSource = await serialize(post.content);
        console.log('MDX serialization successful:', !!mdxSource);
      } catch (error) {
        console.error('MDX serialization failed:', error);
        // Fallback to HTML rendering
        if (post.content) {
          contentHtml = await convertMarkdownToHtml(post.content);
        }
      }
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
    
    // Create a simplified post object to avoid serialization issues
    const safePost = {
      slug: post.slug,
      title: post.title || '',
      date: post.date || '',
      author: post.author || '',
      excerpt: post.excerpt || '',
      tags: post.tags || [],
      image: post.image || null,
      isMDX: post.isMDX
    };
    
    return (
      <BlogPost
        post={safePost}
        contentHtml={contentHtml}
        mdxContent={mdxSource}
        nextPost={nextPost}
        prevPost={prevPost}
      />
    );
  } catch (error) {
    console.error('Error rendering blog post:', error);
    notFound();
  }
}