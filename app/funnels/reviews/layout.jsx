import '../growth-platform/funnel.css'

export const metadata = {
  title: 'Texas AI Reviews — Review Automation for Service Businesses',
  description:
    'Get more Google reviews on autopilot. Texas AI Reviews automates requests, follow-ups, and replies so service businesses rank higher and win more jobs.',
}

export default function ReviewsLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {children}
    </div>
  )
}
