'use client'

import { useEffect } from 'react'
import Head from 'next/head'

export default function ContactCardPage() {
  // Center the image in the viewport
  useEffect(() => {
    // Add any client-side effects if needed
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <Head>
        <title>Elliott Lamboy Contact Card</title>
        <meta name="description" content="Contact information for Elliott Lamboy" />
      </Head>

      {/* Logo at the top */}
      <div className="my-8">
        <img
          src="/img/New-Texas-AI-Logo-V2-Full-Large.png"
          alt="Texas AI Consulting Logo"
          className="h-24 w-auto"
        />
      </div>

      {/* Contact card image */}
      <div className="relative max-h-full max-w-full p-4">
        <img
          src="/img/elliott-contact-card.png"
          alt="Elliott Lamboy Contact Card"
          className="max-h-[70vh] max-w-full rounded-lg shadow-xl"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}