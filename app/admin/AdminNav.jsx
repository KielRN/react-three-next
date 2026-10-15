'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

export default function AdminNav() {
  const path = usePathname()
  const { user, logout } = useAuth()
  if (!user) return null
  return (
    <nav aria-label='Admin navigation' className='border-b border-lcars-ice/15 bg-black/20'>
      <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-4 py-3 text-xs'>
        {[
          ['/admin', 'Command'], ['/admin/mission', 'Missions'], ['/admin/tasks', 'Tasks'], ['/admin/mission/history', 'Service record'],
        ].map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}
            className={`rounded-full px-3 py-2 font-bold ${path === href ? 'bg-ai-gold text-ai-navy' : 'text-lcars-ice/70 hover:bg-white/10 hover:text-white'}`}>
            {label}
          </Link>
        ))}
        <button onClick={logout} className='ml-auto px-3 py-2 text-lcars-ice/60 hover:text-white'>Sign out</button>
      </div>
    </nav>
  )
}
