// Pure prepaid-pay math for contract callers. No DB — safe to import from client components.
//
// A "paid call" is one lead worked by the caller on one Central-time business day: re-logging the
// same lead the same day (e.g. correcting an outcome) is not billed twice. See lib/payStore.js.

export function summarizePay({ rateCents, creditedCents, paidCalls, paidCallsToday = 0 }) {
  const earnedCents = paidCalls * rateCents
  const balanceCents = creditedCents - earnedCents
  return {
    rateCents,
    creditedCents,
    paidCalls,
    paidCallsToday,
    earnedCents,
    balanceCents,
    callsRemaining: balanceCents > 0 ? Math.floor(balanceCents / rateCents) : 0,
    // Calls logged after the prepay ran out — what is owed on the next payment.
    owedCents: balanceCents < 0 ? -balanceCents : 0,
  }
}

export function formatUsd(cents) {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(Math.round(cents))
  return `${sign}$${Math.floor(abs / 100).toLocaleString('en-US')}.${String(abs % 100).padStart(2, '0')}`
}

// Accepts "890", "890.5", "$890.00" → integer cents. Throws on anything else.
export function parseUsd(input) {
  const match = /^\$?(\d+)(?:\.(\d{1,2}))?$/.exec(String(input ?? '').trim())
  if (!match) throw new Error(`Not a dollar amount: ${input}`)
  return Number(match[1]) * 100 + Number((match[2] || '0').padEnd(2, '0'))
}
