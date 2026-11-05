'use client'
import { formatUsd } from '../../../../lib/callerPay'

// Prepaid call balance for contract callers. Renders nothing for callers without a pay account.
export default function PayBalance({ pay }) {
  if (!pay) return null
  const pct = pay.creditedCents > 0 ? Math.min(100, Math.round((pay.earnedCents / pay.creditedCents) * 100)) : 100
  const usedUp = pay.balanceCents <= 0

  return (
    <div className='rounded-2xl bg-black/30 p-4 ring-1 ring-lcars-teal/40'>
      <div className='flex items-center justify-between text-xs uppercase tracking-widest text-lcars-teal'>
        <span>Prepaid balance</span>
        <span className='text-lcars-ice/60'>{formatUsd(pay.rateCents)} / call</span>
      </div>
      <div className='mt-1 flex items-baseline justify-between gap-2'>
        <span className={`text-2xl font-bold ${usedUp ? 'text-lcars-amber' : 'text-white'}`}>
          {usedUp ? 'Prepay used up' : `${formatUsd(pay.balanceCents)} left`}
        </span>
        <span className='text-xs text-lcars-ice/60'>of {formatUsd(pay.creditedCents)} paid</span>
      </div>
      <div className='mt-2 h-3 w-full overflow-hidden rounded-full bg-black/50' aria-hidden='true'>
        <div className='h-full bg-lcars-teal transition-all' style={{ width: `${pct}%` }} />
      </div>
      <div className='mt-2 flex justify-between text-xs text-lcars-ice/70'>
        <span>{pay.paidCalls} paid calls · {pay.paidCallsToday} today</span>
        <span className={usedUp && pay.owedCents ? 'text-lcars-amber' : ''}>
          {usedUp ? (pay.owedCents ? `${formatUsd(pay.owedCents)} earned past prepay` : 'All calls covered') : `${pay.callsRemaining} calls to go`}
        </span>
      </div>
    </div>
  )
}
