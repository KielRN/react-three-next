'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navigation from './Navigation'
import { ReviewsTransmissionBar } from './ReviewsPromo'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

const Layout = ({ children }) => {
  const ref = useRef()
  const pathname = usePathname()

  // Admin tools have their own navigation and do not need the marketing canvas.
  if (pathname === '/admin' || pathname?.startsWith('/admin/')) return <>{children}</>

  // This campaign supplies its own header and has no canvas content.
  if (pathname === '/funnels/chatgpt-deployment' || pathname?.startsWith('/funnels/chatgpt-deployment/')) {
    return <>{children}</>
  }

  // Show the priority transmission bar everywhere except inside the reviews and
  // ChatGPT deployment funnels and the immersive mock-up pages.
  const hideTransmissionBar =
    pathname?.startsWith('/funnels/reviews') ||
    pathname?.startsWith('/funnels/chatgpt-deployment') ||
    pathname?.startsWith('/mock-ups')

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        touchAction: 'auto',
      }}
    >
      <Navigation />
      {!hideTransmissionBar && <ReviewsTransmissionBar />}
      <div className="pt-0">
        {children}
      </div>
      <Scene
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
        eventSource={ref}
        eventPrefix='client'
      />
    </div>
  )
}

export { Layout }
