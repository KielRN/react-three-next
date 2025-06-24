'use client'

import { useEffect } from 'react'
import Head from 'next/head'

export default function ContactCardPage() {
  // Center the image in the viewport
  useEffect(() => {
    // Add any client-side effects if needed
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      <Head>
        <title>Elliott Lamboy Contact Card</title>
        <meta name="description" content="Contact information for Elliott Lamboy" />
      </Head>

      {/* Logo at the top */}
      <div className="mb-8 mt-8">
        <img
          src="/img/New-Texas-AI-Logo-V2-Full-Large.png"
          alt="Texas AI Consulting Logo"
          className="h-24 w-auto"
        />
      </div>

      {/* Contact card image */}
      <div className="relative max-w-full max-h-full p-4">
        <img
          src="/img/elliott-contact-card.png"
          alt="Elliott Lamboy Contact Card"
          className="max-w-full max-h-[70vh] rounded-lg shadow-xl"
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}