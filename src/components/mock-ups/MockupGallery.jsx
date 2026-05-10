'use client'

import { useState, useEffect, useCallback } from 'react'

export default function MockupGallery({ screens, slug }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightbox, setIsLightbox] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState({})

  const active = screens[activeIndex]

  const imageUrl = (screen) => `/api/mock-ups/image/${slug}/${screen.file}`

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((i) => (i > 0 ? i - 1 : screens.length - 1))
        setIsZoomed(false)
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((i) => (i < screens.length - 1 ? i + 1 : 0))
        setIsZoomed(false)
      } else if (e.key === 'Escape') {
        if (isZoomed) setIsZoomed(false)
        else if (isLightbox) setIsLightbox(false)
      }
    },
    [screens.length, isLightbox, isZoomed],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Determine device type from dimensions
  const getDeviceType = (screen) => {
    if (screen.width <= 430) return 'mobile'
    if (screen.width <= 1024) return 'tablet'
    return 'desktop'
  }

  const deviceType = getDeviceType(active)

  return (
    <>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Main image display */}
        <div className='relative'>
          {/* Device frame wrapper */}
          <div
            className='group relative mx-auto cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/50 transition-all duration-500 hover:border-white/20 hover:shadow-[#2c75ff]/10'
            style={{
              maxWidth: deviceType === 'mobile' ? '420px' : deviceType === 'tablet' ? '800px' : '100%',
            }}
            onClick={() => setIsLightbox(true)}
          >
            {/* Device frame top bar */}
            <div className='flex items-center gap-1.5 border-b border-white/5 bg-[#111] px-4 py-2'>
              <div className='h-2.5 w-2.5 rounded-full bg-red-500/60' />
              <div className='h-2.5 w-2.5 rounded-full bg-yellow-500/60' />
              <div className='h-2.5 w-2.5 rounded-full bg-green-500/60' />
              <span className='ml-3 text-[10px] font-medium uppercase tracking-widest text-white/20'>
                {active.label}
              </span>
            </div>

            {/* Image */}
            <div className='relative bg-[#0a0a0a]'>
              {!imageLoaded[activeIndex] && (
                <div className='flex aspect-video items-center justify-center'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#ebcb4c]' />
                </div>
              )}
              <img
                src={imageUrl(active)}
                alt={active.label}
                className={`w-full transition-opacity duration-500 ${imageLoaded[activeIndex] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded((prev) => ({ ...prev, [activeIndex]: true }))}
              />

              {/* Hover overlay */}
              <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20'>
                <div className='scale-90 rounded-full bg-white/10 p-3 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100'>
                  <svg className='h-6 w-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6' />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {active.notes && (
            <div className='mx-auto mt-4 max-w-2xl'>
              <div className='rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3'>
                <div className='mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#ebcb4c]/60'>
                  <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
                  </svg>
                  Design Notes
                </div>
                <p className='text-sm leading-relaxed text-white/50'>{active.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {screens.length > 1 && (
          <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
            {screens.map((screen, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); setIsZoomed(false) }}
                className={`group relative overflow-hidden rounded-lg border transition-all duration-300 ${
                  i === activeIndex
                    ? 'border-[#ebcb4c]/50 shadow-lg shadow-[#ebcb4c]/10'
                    : 'border-white/10 hover:border-white/30'
                }`}
                style={{ width: getDeviceType(screen) === 'mobile' ? '60px' : '120px' }}
              >
                <div className='aspect-video overflow-hidden bg-[#111]'>
                  <img
                    src={imageUrl(screen)}
                    alt={screen.label}
                    className={`h-full w-full object-cover object-top transition-all duration-300 ${
                      i === activeIndex ? 'scale-105' : 'opacity-60 group-hover:opacity-100'
                    }`}
                  />
                </div>
                {/* Active indicator */}
                {i === activeIndex && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ebcb4c] to-[#d4b53f]' />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Screen counter + keyboard hint */}
        <div className='mt-4 flex items-center justify-center gap-4 text-xs text-white/30'>
          <span>
            {activeIndex + 1} / {screens.length}
          </span>
          <span className='hidden sm:inline'>
            <kbd className='rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]'>←</kbd>
            {' '}
            <kbd className='rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px]'>→</kbd>
            {' '}to navigate
          </span>
        </div>
      </div>

      {/* Lightbox overlay */}
      {isLightbox && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm'
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLightbox(false)
              setIsZoomed(false)
            }
          }}
        >
          {/* Close button */}
          <button
            onClick={() => { setIsLightbox(false); setIsZoomed(false) }}
            className='absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/60 transition-colors hover:bg-white/20 hover:text-white'
          >
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>

          {/* Nav arrows */}
          {screens.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i > 0 ? i - 1 : screens.length - 1)); setIsZoomed(false) }}
                className='absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white/60 transition-colors hover:bg-white/20 hover:text-white'
              >
                <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i < screens.length - 1 ? i + 1 : 0)); setIsZoomed(false) }}
                className='absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white/60 transition-colors hover:bg-white/20 hover:text-white'
              >
                <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </>
          )}

          {/* Lightbox image */}
          <div
            className={`max-h-[90vh] max-w-[90vw] transition-transform duration-300 ${isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'}`}
            onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed) }}
          >
            <img
              src={imageUrl(active)}
              alt={active.label}
              className='max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl'
            />
          </div>

          {/* Label */}
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/60 backdrop-blur-sm'>
            {active.label} — {activeIndex + 1}/{screens.length}
          </div>
        </div>
      )}
    </>
  )
}
