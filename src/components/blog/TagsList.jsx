'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function TagsList({ tags, activeTag = null, className = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState(activeTag);

  // Update selected tag when URL query changes
  useEffect(() => {
    setSelected(searchParams.get('tag') || null);
  }, [searchParams]);

  // Handle tag click
  const handleTagClick = (tag) => {
    if (tag === selected) {
      // If the same tag is clicked, clear the filter
      router.push('/blog');
    } else {
      // Otherwise, filter by the clicked tag
      router.push(`/blog?tag=${tag}`);
    }
  };

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <button
        onClick={() => router.push('/blog', undefined, { scroll: false })}
        className={`px-2.5 py-0.5 text-[10px] transition-all font-hesdeadjim uppercase ${
          !selected
            ? 'text-[#0e2042] bg-[#2c75ff]'
            : 'text-[#ffcc00]/90 bg-[#0e2042] hover:bg-[#0e2042]/80 hover:text-[#ffcc00]'
        }`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
          boxShadow: !selected ? '0 0 6px rgba(44, 117, 255, 0.5)' : 'none',
          textShadow: !selected ? '0 0 3px rgba(14, 32, 66, 0.7)' : '0 0 3px rgba(255, 204, 0, 0.5)'
        }}
      >
        All
      </button>

      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-2.5 py-0.5 text-[10px] transition-all font-hesdeadjim uppercase ${
            selected === tag
              ? 'text-[#0e2042] bg-[#2c75ff]'
              : 'text-[#ffcc00]/90 bg-[#0e2042] hover:bg-[#0e2042]/80 hover:text-[#ffcc00]'
          }`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
            boxShadow: selected === tag ? '0 0 6px rgba(44, 117, 255, 0.5)' : 'none',
            textShadow: selected === tag ? '0 0 3px rgba(14, 32, 66, 0.7)' : '0 0 3px rgba(255, 204, 0, 0.5)'
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}