import { Layout } from '@/components/dom/Layout'
import '@/global.css'

export const metadata = {
  title: 'Texas AI Consulting',
  description: 'A minimal starter for Nextjs + React-three-fiber and Threejs.',
}

// Import Space Mono font
import { Space_Mono } from 'next/font/google'

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
      <head />
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
