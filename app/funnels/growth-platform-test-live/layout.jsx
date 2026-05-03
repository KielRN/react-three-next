import './funnel.css'

export const metadata = {
  robots: 'noindex, nofollow', // Default for funnel — override per page
}

export default function GrowthPlatformLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {children}
    </div>
  )
}
