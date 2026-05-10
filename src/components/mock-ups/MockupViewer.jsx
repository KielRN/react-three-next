'use client'

import MockupHeader from './MockupHeader'
import MockupGallery from './MockupGallery'

export default function MockupViewer({ mockup }) {
  return (
    <div className='min-h-screen bg-[#060b14]'>
      <MockupHeader
        title={mockup.title}
        client={mockup.client}
        date={mockup.date}
        status={mockup.status}
        description={mockup.description}
      />

      <MockupGallery screens={mockup.screens} slug={mockup.slug} />

      {/* Tags */}
      {mockup.tags?.length > 0 && (
        <div className='mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            {mockup.tags.map((tag) => (
              <span
                key={tag}
                className='rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/25'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className='border-t border-white/5 py-6'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-[#ebcb4c] to-[#d4b53f]'>
              <span className='text-[8px] font-black text-[#0e2042]'>TX</span>
            </div>
            <span className='text-xs text-white/30'>Texas AI Consulting</span>
          </div>
          <span className='text-[10px] text-white/20'>Confidential — For Review Only</span>
        </div>
      </footer>
    </div>
  )
}
