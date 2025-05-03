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
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button 
        onClick={() => router.push('/blog', undefined, { scroll: false })}
        className={`px-3 py-1 rounded-full text-sm transition-colors ${
          !selected
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        All
      </button>
      
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleTagClick(tag)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selected === tag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}