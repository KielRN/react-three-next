'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { EVENTS, measure } from './pixel'

// Loads the OpenAI Ads pixel for this funnel only and sends page_viewed on every
// funnel page (landing, booking, thank-you). The funnel layout stays mounted
// between those pages, so the event is keyed on the pathname.
export default function OpenAIPixel() {
  const pathname = usePathname()

  useEffect(() => {
    // Effects can run twice for one visit (React dev mode, remounts); count each page once.
    if (window.__txaiLastPageView === pathname) return
    window.__txaiLastPageView = pathname
    measure(EVENTS.PAGE_VIEWED, {
      type: 'contents',
      contents: [{ id: pathname, name: document.title, content_type: 'page' }],
    })
  }, [pathname])

  return null
}
