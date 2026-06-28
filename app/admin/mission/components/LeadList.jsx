'use client'

// Full-list view for Mission Control. Renders every lead in the week as a compact
// row (status at a glance), reusing the row style from the history page. Tapping a
// row hands the lead back to the caller via onSelect so the gamified LeadCard /
// outcome flow can act on it. Sort order from the API is preserved (not_called →
// follow_up → others), so the call queue stays obvious.

const STATUS = {
  not_called: { label: 'NEW', cls: 'text-lcars-amber' },
  follow_up: { label: 'FOLLOW UP', cls: 'text-lcars-amber/80' },
  no_answer: { label: 'NO ANSWER', cls: 'text-lcars-ice/50' },
  not_interested: { label: 'NOT INT.', cls: 'text-lcars-ice/50' },
  disqualified: { label: 'DQ', cls: 'text-lcars-rust' },
  called: { label: 'CALLED', cls: 'text-lcars-ice/50' },
}

function statusFor(lead) {
  if (lead.won) return { label: `BOOKED · ${(lead.won_tier || '').toUpperCase()}`.trim(), cls: 'text-lcars-teal' }
  return STATUS[lead.status] || { label: (lead.status || '').toUpperCase(), cls: 'text-lcars-ice/50' }
}

export default function LeadList({ leads, activeId, onSelect }) {
  if (!leads?.length) {
    return <p className='py-8 text-center text-xs uppercase tracking-widest text-lcars-ice/50'>No leads in this week.</p>
  }
  return (
    <div className='flex flex-col gap-1'>
      {leads.map((lead) => {
        const s = statusFor(lead)
        const active = lead.id === activeId
        return (
          <button
            key={lead.id}
            onClick={() => onSelect(lead.id)}
            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs active:scale-[0.99] ${
              active ? 'bg-ai-blue/20 ring-1 ring-ai-blue/50' : 'bg-black/20'
            }`}>
            <span className='min-w-0 flex-1'>
              <span className='block truncate font-bold text-lcars-ice'>{lead.business}</span>
              <span className='block truncate text-[10px] text-lcars-ice/50'>
                {lead.phone}
                {lead.rating != null ? ` · ★ ${lead.rating}${lead.reviews_count ? ` (${lead.reviews_count})` : ''}` : ''}
              </span>
            </span>
            <span className={`shrink-0 text-right text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>{s.label}</span>
          </button>
        )
      })}
    </div>
  )
}
