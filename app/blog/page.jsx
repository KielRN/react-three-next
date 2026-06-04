import { getAllBlogPosts, getAllTags, getBlogPostsByTag } from '../../lib/blog';
import BlogHeader from '../../src/components/blog/BlogHeader';
import BlogList from '../../src/components/blog/BlogList';

export const metadata = {
  title: 'Blog | Texas AI Consulting',
  description: 'Explore the latest insights, tutorials, and news about AI, web development, and digital innovation.',
  openGraph: {
    title: 'Blog | Texas AI Consulting',
    description: 'Explore the latest insights, tutorials, and news about AI, web development, and digital innovation.',
    url: 'https://texasai.consulting/blog',
    type: 'website',
  },
};

export default async function BlogPage({ searchParams }) {
  const tag = searchParams?.tag || null;
  const allTags = await getAllTags();
  const posts = tag ? await getBlogPostsByTag(tag) : await getAllBlogPosts();

  return (
    <div className="-mt-px min-h-screen w-full overflow-x-hidden bg-ai-surface-dark">
      <BlogHeader />

      <main className="container mx-auto max-w-6xl overflow-hidden px-4 pb-12 pt-4">
        <BlogList
          posts={posts}
          allTags={allTags}
          activeTag={tag}
        />
      </main>
    </div>
  );
}