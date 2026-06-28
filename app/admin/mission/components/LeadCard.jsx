'use client'
import OutcomeButtons from './OutcomeButtons'
import { CALL_BUTTON } from '../../lib/assets'

export default function LeadCard({ lead, onOutcome, busy }) {
  if (!lead) return null
  return (
    <div className='rounded-3xl bg-gradient-to-b from-black/40 to-ai-navy p-5 ring-1 ring-ai-blue/40'>
      <p className='text-xs uppercase tracking-[0.3em] text-ai-blue'>Next Target</p>
      <h2 className='mt-1 text-2xl font-bold text-lcars-ice'>{lead.business}</h2>
      {lead.owner && <p className='text-sm text-lcars-ice/70'>{lead.owner}</p>}
      <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-lcars-ice/60'>
        {lead.rating != null && <span>★ {lead.rating}{lead.reviews_count ? ` (${lead.reviews_count})` : ''}</span>}
        {lead.competitor && <span>vs {lead.competitor}</span>}
        {lead.address && <span>{lead.address}</span>}
      </div>

      <a href={`tel:${lead.phone}`}
        className='mt-4 flex items-center justify-center gap-3 rounded-full bg-ai-blue py-4 text-lg font-bold uppercase tracking-widest text-white active:scale-95'>
        <img src={CALL_BUTTON} alt='' className='h-7 w-7' />
        Call {lead.phone}
      </a>

      <div className='mt-4'>
        <OutcomeButtons busy={busy} onSubmit={(payload) => onOutcome(lead.id, payload)} />
      </div>
    </div>
  )
}
