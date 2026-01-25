import { Layout } from '@/components/dom/Layout'
import './global.css'
import { Space_Mono } from 'next/font/google'

export const metadata = {
  metadataBase: new URL('https://texasaiconsulting.com'),
  title: {
    default: 'Texas AI Consulting | AI Solutions for Small Business',
    template: '%s | Texas AI Consulting',
  },
  description: 'Big AI For Small Businesses in San Antonio, Austin and Central Texas. Transform your business with AI-powered sales, operations, and marketing automation.',
  keywords: ['AI consulting', 'artificial intelligence', 'small business AI', 'Texas AI', 'San Antonio AI', 'Austin AI', 'Central Texas', 'AI automation', 'sales automation', 'marketing automation', 'business intelligence', 'AI agents', 'machine learning', 'ChatGPT for business', 'AI integration'],
  authors: [{ name: 'Texas AI Consulting' }],
  creator: 'Texas AI Consulting',
  publisher: 'Texas AI Consulting',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: 'Texas AI Consulting | AI Solutions for Small Business',
    description: 'Big AI For Small Businesses in San Antonio, Austin and Central Texas. Transform your business with AI-powered sales, operations, and marketing automation.',
    url: 'https://texasaiconsulting.com',
    siteName: 'Texas AI Consulting',
    images: [
      {
        url: '/img/Texas-AI-Consulting-ST-Logo-ICON.png',
        width: 1200,
        height: 630,
        alt: 'Texas AI Consulting Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Texas AI Consulting | AI Solutions for Small Business',
    description: 'Big AI For Small Businesses in San Antonio, Austin and Central Texas. Transform your business with AI-powered sales, operations, and marketing automation.',
    creator: '@texasaiconsulting',
    images: ['/img/Texas-AI-Consulting-ST-Logo-ICON.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'G-S46TGFXZQF',
  },
}

// Initialize the font with subset
export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
})

export default function RootLayout({ children }) {
  // Structured Data for Organization and LocalBusiness
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://texasaiconsulting.com/#organization',
        name: 'Texas AI Consulting',
        url: 'https://texasaiconsulting.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://texasaiconsulting.com/img/Texas-AI-Consulting-ST-Logo-ICON.png',
          width: 512,
          height: 512,
        },
        sameAs: [
          'https://twitter.com/texasaiconsulting',
          'https://www.linkedin.com/company/texas-ai-consulting',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Sales',
          areaServed: ['US-TX'],
          availableLanguage: ['en'],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': 'https://texasaiconsulting.com/#localbusiness',
        name: 'Texas AI Consulting',
        description: 'Big AI For Small Businesses in San Antonio, Austin and Central Texas. Transform your business with AI-powered sales, operations, and marketing automation.',
        url: 'https://texasaiconsulting.com',
        telephone: '+1-210-555-0100',
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'San Antonio',
          addressRegion: 'TX',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 29.4241,
          longitude: -98.4936,
        },
        areaServed: [
          {
            '@type': 'City',
            name: 'San Antonio',
          },
          {
            '@type': 'City',
            name: 'Austin',
          },
          {
            '@type': 'State',
            name: 'Central Texas',
          },
        ],
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '17:00',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://texasaiconsulting.com/#website',
        url: 'https://texasaiconsulting.com',
        name: 'Texas AI Consulting',
        description: 'Big AI For Small Businesses in San Antonio, Austin and Central Texas',
        publisher: {
          '@id': 'https://texasaiconsulting.com/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://texasaiconsulting.com/blog?search={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ProfessionalService',
        '@id': 'https://texasaiconsulting.com/#service',
        name: 'Texas AI Consulting',
        description: 'AI consulting and automation services for small businesses',
        serviceType: ['AI Consulting', 'Business Automation', 'AI Integration', 'Machine Learning Solutions'],
        areaServed: {
          '@type': 'State',
          name: 'Texas',
        },
        provider: {
          '@id': 'https://texasaiconsulting.com/#organization',
        },
      },
    ],
  };

  return (
    <html lang='en' className={`antialiased ${spaceMono.variable}`}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-S46TGFXZQF"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S46TGFXZQF');
          `
        }} />
        {/* Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/Favicon-New-Texas-AI-Logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/img/Favicon-New-Texas-AI-Logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/img/Favicon-New-Texas-AI-Logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#ebcb4c" />
        <meta name="msapplication-TileColor" content="#ebcb4c" />
        <meta name="theme-color" content="#ebcb4c" />
      </head>
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
