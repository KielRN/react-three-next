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
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden -mt-[1px]">
      <BlogHeader />
      
      <main className="container mx-auto px-4 pt-6 pb-12 max-w-6xl overflow-hidden">
        <BlogList
          posts={posts}
          allTags={allTags}
          activeTag={tag}
        />
      </main>
    </div>
  );
}