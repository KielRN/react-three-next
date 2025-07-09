import { Layout } from '@/components/dom/Layout'
import './global.css'
import { Space_Mono } from 'next/font/google'

export const metadata = {
  title: 'Texas AI Consulting',
  description: 'Big AI For Small Businesses in San Antonio, Austin and Central Texas',
}

// Initialize the font with subset
export const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
})

export default function RootLayout({ children }) {
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/Favicon-New-Texas-AI-Logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/img/Favicon-New-Texas-AI-Logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/img/Favicon-New-Texas-AI-Logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
