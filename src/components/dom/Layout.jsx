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

  // Show the priority transmission bar everywhere except inside the reviews funnel
  // and the immersive mock-up pages.
  const hideTransmissionBar =
    pathname?.startsWith('/funnels/reviews') || pathname?.startsWith('/mock-ups')

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
