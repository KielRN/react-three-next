'use client'

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../../../lib/blogUtils';

export default function BlogCard({ post }) {
  return (
    <div className="group rounded-lg overflow-hidden bg-ai-surface-dark shadow-md hover:shadow-xl transition-all duration-300 border-l-2 border-b-2 border-ai-blue shadow-ai-blue/40">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title || "Blog post featured image"}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-ai-navy to-gray-900" />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center flex-wrap gap-1 mb-3">
            {post.tags && post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-ai-navy text-ai-gold font-hesdeadjim shadow-[0_0_5px_rgba(255,204,0,0.7)]"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-xl font-bold mb-2 text-ai-blue group-hover:text-ai-gold transition-colors duration-300 font-hesdeadjim shadow-ai-blue/70 drop-shadow-[0_0_5px_rgba(44,117,255,0.7)]">
            {post.title}
          </h2>

          <p className="text-sm text-gray-300 mb-4">
            {formatDate(post.date)} • {post.author}
          </p>

          <p className="text-white mb-4">
            {post.excerpt}
          </p>

          <div className="mt-2 text-right">
            <span className="inline-block px-4 py-1 text-sm text-ai-gold bg-ai-navy font-hesdeadjim shadow-[0_0_5px_rgba(255,204,0,0.7)]"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
              }}>
              READ MORE
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}