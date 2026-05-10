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

      {/* Spacer so sticky footer doesn't cover content */}
      <div className='h-20' />

      {/* Sticky Footer Bar */}
      <footer
        className='fixed bottom-0 left-0 right-0 z-40'
        style={{
          background: 'linear-gradient(to right, rgba(0,10,30,0.97), rgba(0,0,0,0.98), rgba(0,10,30,0.97))',
          borderTop: '2px solid #2c75ff',
          boxShadow: '0 -4px 20px rgba(44, 117, 255, 0.3)',
        }}
      >
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8'>
          {/* Left: mockup notice */}
          <div className='hidden items-center gap-2 sm:flex'>
            <div className='h-5 w-1.5 rounded-sm bg-[#2c75ff]' style={{ boxShadow: '0 0 6px rgba(44, 117, 255, 0.7)' }} />
            <span className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2c75ff]/70'>
              Mockup Preview
            </span>
            <div className='h-3 w-0.5 rounded-full bg-white/10' />
            <span className='text-[10px] text-white/30'>
              Confidential — For Review Only
            </span>
          </div>

          {/* Right: Return button */}
          <a
            href='https://texasaiconsulting.com'
            className='group relative font-hesdeadjim text-sm uppercase tracking-wider'
            style={{
              clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
            }}
          >
            <span
              className='relative z-10 flex items-center gap-2 px-6 py-2.5 transition-all duration-300'
              style={{
                background: 'linear-gradient(135deg, #ebcb4c, #d4b53f)',
                color: '#0e2042',
                textShadow: 'none',
              }}
            >
              <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2.5}>
                <path strokeLinecap='round' strokeLinejoin='round' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
              </svg>
              Texas AI Consulting
            </span>
          </a>
        </div>
      </footer>
    </div>
  )
}
