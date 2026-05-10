import Link from 'next/link'
import { getAllMockups } from '../../lib/mockups'

export const metadata = {
  title: 'Mockups',
  description: 'Internal mockup review dashboard.',
  robots: { index: false, follow: false },
}

const statusStyles = {
  review: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  approved: 'border-green-500/40 bg-green-500/10 text-green-400',
  revision: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
}

const statusLabels = {
  review: 'In Review',
  approved: 'Approved',
  revision: 'Revision',
}

export default async function MockupsIndexPage() {
  const mockups = await getAllMockups()

  return (
    <div className='min-h-screen bg-[#060b14]'>
      {/* Header */}
      <header className='border-b border-white/10 bg-gradient-to-r from-[#0a1628] via-[#0e2042] to-[#0a1628]'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#ebcb4c] to-[#d4b53f] shadow-lg shadow-[#ebcb4c]/20'>
              <span className='text-lg font-black text-[#0e2042]'>TX</span>
            </div>
            <div>
              <h1 className='text-2xl font-bold text-white'>Mockups</h1>
              <p className='text-xs text-white/40'>Client review dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
        {mockups.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='mb-4 rounded-full bg-white/5 p-4'>
              <svg className='h-8 w-8 text-white/20' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
              </svg>
            </div>
            <p className='text-sm text-white/40'>No mockups yet.</p>
            <p className='mt-1 text-xs text-white/20'>Create one in <code className='rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]'>content/mock-ups/</code></p>
          </div>
        ) : (
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {mockups.map((mockup) => {
              const firstScreen = mockup.screens?.[0]
              const thumbUrl = firstScreen
                ? `/api/mock-ups/image/${mockup.slug}/${firstScreen.file}`
                : null

              return (
                <Link
                  key={mockup.slug}
                  href={`/mock-ups/${mockup.slug}`}
                  className='group relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1420] transition-all duration-300 hover:border-[#ebcb4c]/30 hover:shadow-lg hover:shadow-[#ebcb4c]/5'
                >
                  {/* Thumbnail */}
                  <div className='aspect-video overflow-hidden bg-[#080c14]'>
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={mockup.title}
                        className='h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <svg className='h-10 w-10 text-white/10' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className='p-4'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <h2 className='text-sm font-semibold text-white group-hover:text-[#ebcb4c] transition-colors duration-300'>
                          {mockup.title}
                        </h2>
                        {mockup.client && (
                          <p className='mt-0.5 text-xs text-white/40'>{mockup.client}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[mockup.status] || statusStyles.review}`}>
                        {statusLabels[mockup.status] || 'Review'}
                      </span>
                    </div>

                    <div className='mt-3 flex items-center justify-between text-[10px] text-white/25'>
                      <span>{new Date(mockup.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>{mockup.screens?.length || 0} screens</span>
                    </div>
                  </div>

                  {/* Hover gradient */}
                  <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-[#ebcb4c]/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
