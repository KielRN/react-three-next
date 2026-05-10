'use client'

const statusColors = {
  review: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', label: 'In Review' },
  approved: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40', label: 'Approved' },
  revision: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', label: 'Revision Requested' },
}

export default function MockupHeader({ title, client, date, status, description }) {
  const s = statusColors[status] || statusColors.review

  return (
    <header className='relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-[#0a1628] via-[#0e2042] to-[#0a1628]'>
      {/* Decorative accents */}
      <div className='pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#2c75ff]/5 blur-3xl' />
      <div className='pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ebcb4c]/5 blur-3xl' />

      <div className='relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          {/* Left: branding + title */}
          <div className='flex items-center gap-4'>
            {/* Logo mark */}
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ebcb4c] to-[#d4b53f] shadow-lg shadow-[#ebcb4c]/20'>
              <span className='text-lg font-black text-[#0e2042]'>TX</span>
            </div>

            <div>
              <h1 className='text-lg font-bold leading-tight text-white sm:text-xl lg:text-2xl'>
                {title}
              </h1>
              <div className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-white/50'>
                {client && (
                  <>
                    <span className='text-[#ebcb4c]/70'>{client}</span>
                    <span className='text-white/20'>•</span>
                  </>
                )}
                <span>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Right: status badge */}
          <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1 text-xs font-semibold ${s.bg} ${s.text} ${s.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status === 'approved' ? 'bg-green-400' : status === 'revision' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
            {s.label}
          </div>
        </div>

        {description && (
          <p className='mt-3 max-w-2xl text-sm leading-relaxed text-white/40'>
            {description}
          </p>
        )}
      </div>
    </header>
  )
}
