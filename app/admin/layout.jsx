import AuthProvider from './AuthProvider'

export const metadata = {
  title: 'Mission Control',
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <div className='min-h-screen bg-ai-navy text-lcars-ice font-mono'>{children}</div>
    </AuthProvider>
  )
}
