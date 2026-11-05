import { getAllBlogPosts, getAllTags, getBlogPostsByTag } from '../../lib/blog';
import BlogHeader from '../../src/components/blog/BlogHeader';
import BlogList from '../../src/components/blog/BlogList';

export function generateMetadata({ searchParams }) {
  const filtered = Boolean(searchParams?.tag || searchParams?.search);
  const description = 'Practical AI guides, business automation tips, and client case studies for small businesses in San Antonio, Austin, and across Texas.';

  return {
    title: 'AI & Business Automation Insights',
    description,
    alternates: { canonical: '/blog' },
    ...(filtered ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
    openGraph: {
      title: 'AI & Business Automation Insights | Texas AI Consulting',
      description,
      url: 'https://texasaiconsulting.com/blog',
      type: 'website',
    },
  };
}

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
