'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';
// import { MDXRemote } from 'next-mdx-remote';

// LCARS decorative elements
const LCARSDecoration = ({ className = '' }) => (
  <div className={`flex items-center space-x-1 ${className}`}>
    <div className="h-6 w-2 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
    <div className="h-10 w-1 bg-[#2c75ff] rounded-sm" style={{boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}></div>
    <div className="h-4 w-3 bg-[#ffcc00] rounded-sm" style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.7)'}}></div>
  </div>
);

export default function BlogLayout({ post, contentHtml, mdxContent, nextPost, prevPost }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  // Debug logging -- commented
  console.log('BlogLayout Debug:', {
    isMDX: post.isMDX,
    hasMdxSource: !!mdxContent,
    contentHtmlLength: contentHtml?.length || 0,
    mdxSourceKeys: mdxContent ? Object.keys(mdxContent) : 'none'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: `Question about: ${post.title}`
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="h-6 w-4 bg-[#2c75ff] rounded-sm mr-2" style={{boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}></div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2c75ff] font-hesdeadjim"
            style={{textShadow: '0 0 10px rgba(44, 117, 255, 0.7)'}}>
            {post.title}
          </h1>
        </div>
        
        <div className="flex items-center text-gray-300 mb-6 ml-6 border-l-2 border-[#ffcc00] pl-3"
          style={{boxShadow: '0 0 5px rgba(255, 204, 0, 0.3)'}}>
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
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
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
            <p>post.isMDX: {String(post.isMDX)}</p>
            <p>mdxSource: {mdxContent ? 'exists' : 'null'}</p>
            <p>contentHtml: {contentHtml ? 'exists' : 'null'}</p>
          </div>
        )}
        
        <style jsx global>{`
          pre {
            max-width: 100%;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #1e2538 !important;
            border: 1px solid #2d3748;
            border-radius: 0.5rem;
            padding: 1.25rem;
            margin: 1.5rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .prose pre code {
            color: #f8f8f2 !important;
            font-size: 1rem !important;
          }
          
          .prose * {
            color: white !important;
          }
          
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            color: #2c75ff !important;
            font-family: 'HesDeadJim', Arial, sans-serif !important;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            text-shadow: 0 0 5px rgba(44, 117, 255, 0.7);
            position: relative;
            padding-left: 10px;
          }
          
          .prose h2::before, .prose h3::before, .prose h4::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 70%;
            background-color: #ffcc00;
            box-shadow: 0 0 5px rgba(255, 204, 0, 0.7);
            border-radius: 2px;
          }
          
          .prose a {
            color: #2c75ff !important;
            text-decoration: none;
            text-shadow: 0 0 3px rgba(44, 117, 255, 0.5);
            padding: 0 2px;
            border-bottom: 1px solid #2c75ff;
            transition: all 0.3s ease;
          }
          
          .prose a:hover {
            background-color: rgba(44, 117, 255, 0.1);
            text-shadow: 0 0 5px rgba(44, 117, 255, 0.7);
          }
          
          .prose p {
            margin-bottom: 1.25rem;
            line-height: 1.75;
          }
          
          .prose ul, .prose ol {
            margin-top: 1rem;
            margin-bottom: 1rem;
            margin-left: 1.5rem;
          }
          
          .prose li {
            margin-bottom: 0.5rem;
          }
          
          .prose blockquote {
            color: white !important;
            border-left-color: #ffcc00 !important;
            border-left-width: 3px;
            background-color: rgba(14, 32, 66, 0.4);
            padding: 1rem;
            margin: 1.5rem 0;
            box-shadow: 0 0 10px rgba(44, 117, 255, 0.2);
          }
          
          .prose img {
            margin: 1.5rem 0;
            border-radius: 0.5rem;
          }

          .prose table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            background-color: rgba(14, 32, 66, 0.4);
            border-radius: 0.5rem;
            overflow: hidden;
          }
          
          .prose th {
            background-color: #0e2042 !important;
            color: #ffcc00 !important;
            font-family: 'HesDeadJim', Arial, sans-serif !important;
            font-weight: bold;
            padding: 1rem;
            text-align: left;
            border-bottom: 2px solid #2c75ff;
          }
          
          .prose td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid rgba(44, 117, 255, 0.2);
            color: white !important;
          }
          
          .prose tr:nth-child(even) {
            background-color: rgba(44, 117, 255, 0.05);
          }
          
          .prose tr:hover {
            background-color: rgba(44, 117, 255, 0.1);
          }
          
          .prose strong {
            color: #ffcc00 !important;
            font-weight: bold;
          }
          
          .prose em {
            color: #2c75ff !important;
            font-style: italic;
          }
        `}</style>
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
              style={{boxShadow: '0 0 5px rgba(44, 117, 255, 0.7)'}}></div>
            <h2 className="text-2xl font-bold text-[#ffcc00] font-hesdeadjim"
              style={{textShadow: '0 0 10px rgba(255, 204, 0, 0.7)'}}>
              Have Questions About This Article?
            </h2>
          </div>
          
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Get in touch with our team to discuss this topic further or explore how we can help with your project.
          </p>
          
          {/* Inline Contact Form */}
          <div className="bg-gray-900/80 p-6 rounded-lg border border-[#2c75ff]/40"
            style={{
              boxShadow: '0 0 10px rgba(44, 117, 255, 0.2)'
            }}>
            <h3 className="text-xl font-bold text-[#2c75ff] font-hesdeadjim mb-6"
              style={{textShadow: '0 0 8px rgba(44, 117, 255, 0.7)'}}>
              Send Us a Message
            </h3>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-md text-green-300">
                Thanks for your message! We'll get back to you soon.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-300">
                Sorry, there was an error sending your message. Please try again.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-[#2c75ff] font-hesdeadjim tracking-wider"
                    style={{textShadow: '0 0 5px rgba(44, 117, 255, 0.5)'}}>
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-2 border-gray-700 focus:border-[#2c75ff] text-white rounded-md w-full py-3 px-4 transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(44,117,255,0.5)] hover:border-gray-600"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-[#2c75ff] font-hesdeadjim tracking-wider"
                    style={{textShadow: '0 0 5px rgba(44, 117, 255, 0.5)'}}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-2 border-gray-700 focus:border-[#2c75ff] text-white rounded-md w-full py-3 px-4 transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(44,117,255,0.5)] hover:border-gray-600"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-[#2c75ff] font-hesdeadjim tracking-wider"
                  style={{textShadow: '0 0 5px rgba(44, 117, 255, 0.5)'}}>
                  MESSAGE
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="bg-gray-800 border-2 border-gray-700 focus:border-[#2c75ff] text-white rounded-md w-full py-3 px-4 transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(44,117,255,0.5)] hover:border-gray-600 min-h-[120px]"
                  rows="5"
                  placeholder="Your message..."
                  required
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#2c75ff] hover:bg-[#3d86ff] disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 font-hesdeadjim uppercase tracking-wider disabled:cursor-not-allowed disabled:transform-none"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                    textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 0 15px rgba(44, 117, 255, 0.4)'
                  }}
                >
                  {isSubmitting ? 'BEAMING...' : 'ENERGIZE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}