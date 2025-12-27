
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';
import TypewriterText from './TypewriterText';
import { MDXRemote } from 'next-mdx-remote/rsc';
import ContactForm from './ContactForm';
import BlogStyles from './BlogStyles';

// LCARS decorative elements
const LCARSDecoration = ({ className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    <div className="h-6 w-2 bg-[#ffcc00] rounded-sm" style={{ boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)' }}></div>
    <div className="h-10 w-1 bg-[#2c75ff] rounded-sm" style={{ boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)' }}></div>
    <div className="h-4 w-3 bg-[#ffcc00] rounded-sm" style={{ boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)' }}></div>
  </div>
);

export default function BlogLayout({ post, contentHtml, mdxContent, nextPost, prevPost }) {
  // Custom components for MDX
  const mdxComponents = {
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold text-[#2c75ff] font-hesdeadjim"
        style={{ textShadow: '0 0 10px rgba(44, 117, 255, 0.7)' }}>
        <TypewriterText text={children} />
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold text-[#2c75ff] font-hesdeadjim"
        style={{ textShadow: '0 0 8px rgba(44, 117, 255, 0.7)' }}>
        <TypewriterText text={children} speed={25} delay={500} />
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-bold text-[#2c75ff] font-hesdeadjim"
        style={{ textShadow: '0 0 6px rgba(44, 117, 255, 0.7)' }}>
        <TypewriterText text={children} speed={20} delay={800} />
      </h3>
    ),
    TypewriterText,
  };

  return (
    <div className="container mx-auto px-4 py-0 max-w-4xl">
      {/* Back to blog link */}
      <div className="my-8 flex items-center">
        <LCARSDecoration className="mr-3" />
        <Link
          href="/blog"
          className="text-[#ffcc00] bg-[#0e2042] px-4 py-1 flex items-center font-hesdeadjim"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
            textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
            boxShadow: '0 0 8px rgba(44, 117, 255, 0.4)'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Blog
        </Link>
      </div>

      {/* Blog header */}
      <header className="mb-8">
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden border-l-2 border-t-2 border-[#2c75ff]"
          style={{
            boxShadow: '0 0 15px rgba(44, 117, 255, 0.5)',
            animation: 'border-pulse 3s infinite'
          }}>
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title || "Blog post header image"}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#0e2042] to-gray-900"></div>
          )}
        </div>

        <div className="flex items-center mb-2">
          <div className="h-6 w-4 bg-[#2c75ff] rounded-sm mr-2" style={{ boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)' }}></div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2c75ff] font-hesdeadjim"
            style={{ textShadow: '0 0 10px rgba(44, 117, 255, 0.7)' }}>
            <TypewriterText text={post.title} />
          </h1>
        </div>

        <div className="flex items-center text-gray-300 mb-6 ml-6 border-l-2 border-[#ffcc00] pl-3"
          style={{ boxShadow: '0 0 5px rgba(255, 204, 0, 0.3)' }}>
          <span>{formatDate(post.date)}</span>
          <span className="mx-2 text-[#ffcc00]">•</span>
          <span>{post.author}</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="px-3 py-1 bg-[#0e2042] text-[#ffcc00] text-sm transition-colors font-hesdeadjim"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                  textShadow: '0 0 5px rgba(255, 204, 0, 0.7)',
                  boxShadow: '0 0 8px rgba(44, 117, 255, 0.4)',
                }}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Blog content */}
      <article className="prose prose-lg max-w-none bg-gray-900 p-6 rounded-lg dark:prose-invert prose-p:text-white prose-li:text-white prose-headings:font-bold prose-a:text-[#2c75ff] prose-img:rounded-lg overflow-visible prose-pre:overflow-x-auto prose-pre:max-w-full"
        style={{
          borderLeft: '2px solid #2c75ff',
          borderBottom: '2px solid #2c75ff',
          boxShadow: '0 0 15px rgba(44, 117, 255, 0.4)',
        }}>

        {post.isMDX && mdxContent ? (
          <div>
            <MDXRemote
              source={mdxContent}
              components={mdxComponents}
            />
          </div>
        ) : contentHtml ? (
          <div>
            <div
              dangerouslySetInnerHTML={{ __html: contentHtml }}
              className="break-words"
              style={{
                maxWidth: '100%',
                overflowWrap: 'break-word',
                color: 'white'
              }}
            />
          </div>
        ) : (
          <div style={{ color: 'red', padding: '20px' }}>
            <p>No content to display!</p>
          </div>
        )}

        <BlogStyles />
      </article>

      {/* Navigation */}
      {(nextPost || prevPost) && (
        <nav className="flex justify-between items-center mt-12 pt-8 border-t border-[#2c75ff]/30">
          <div className="flex-1">
            {prevPost && (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group flex flex-col items-start p-4 bg-[#0e2042]/50 rounded-lg border border-[#2c75ff]/30 hover:border-[#ffcc00]/50 transition-colors"
              >
                <span className="text-sm text-gray-400 mb-1">Previous</span>
                <span className="text-[#2c75ff] group-hover:text-[#ffcc00] font-semibold transition-colors">
                  {prevPost.title}
                </span>
              </Link>
            )}
          </div>

          <div className="flex-1 flex justify-end">
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group flex flex-col items-end p-4 bg-[#0e2042]/50 rounded-lg border border-[#2c75ff]/30 hover:border-[#ffcc00]/50 transition-colors"
              >
                <span className="text-sm text-gray-400 mb-1">Next</span>
                <span className="text-[#2c75ff] group-hover:text-[#ffcc00] font-semibold transition-colors text-right">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* Contact section */}
      <section className="mt-16 pt-12 border-t border-[#2c75ff]/30">
        <div className="bg-gray-800/50 rounded-lg p-8 border border-[#2c75ff]/30"
          style={{
            borderLeft: '2px solid #2c75ff',
            borderBottom: '2px solid #2c75ff',
            boxShadow: '0 0 15px rgba(44, 117, 255, 0.4)'
          }}>

          <div className="flex items-center mb-6">
            <div className="h-6 w-4 bg-[#2c75ff] rounded-sm mr-2"
              style={{ boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)' }}></div>
            <h2 className="text-2xl font-bold text-[#ffcc00] font-hesdeadjim"
              style={{ textShadow: '0 0 10px rgba(255, 204, 0, 0.7)' }}>
              Have Questions About This Article?
            </h2>
          </div>

          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Get in touch with our team to discuss this topic further or explore how we can help with your project.
          </p>

          <ContactForm postTitle={post.title} />
        </div>
      </section>
    </div>
  );
}