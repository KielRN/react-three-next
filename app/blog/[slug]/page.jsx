import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getAllBlogPosts, convertMarkdownToHtml } from '../../../lib/blog';
import BlogPost from '../../../src/components/blog/BlogPost';
// Remove MDXRemote import

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
  try {
    const post = await getBlogPostBySlug(params.slug);
    
    if (!post) {
      console.log(`Post not found for slug: ${params.slug}`);
      notFound();
    }
    
    // Convert all content to HTML regardless of whether it's MDX or MD
    let contentHtml = await convertMarkdownToHtml(post.content || '');
    
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
      image: post.image || null
    };
    
    // Treat all posts the same way for now
    return (
      <BlogPost
        post={safePost}
        contentHtml={contentHtml}
        nextPost={nextPost}
        prevPost={prevPost}
      />
    );
  } catch (error) {
    console.error('Error rendering blog post:', error);
    notFound();
  }
}