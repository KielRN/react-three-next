import AuthProvider from './AuthProvider'
import AdminNav from './AdminNav'

export const metadata = {
  title: 'Admin Command',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className='min-h-screen bg-ai-navy font-mono text-lcars-ice'><AdminNav />{children}</div>
    </AuthProvider>
  )
}
