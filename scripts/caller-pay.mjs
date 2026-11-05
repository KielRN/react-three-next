import { parseArgs } from 'node:util'
import { formatUsd, parseUsd } from '../lib/callerPay.js'
import { businessDate } from '../lib/taskSchedule.js'

const usage = `Usage (run from react-three-next/):
  node --env-file=.env scripts/caller-pay.mjs status [--email <login>]
  node --env-file=.env scripts/caller-pay.mjs open   --email <login> --rate <dollars per call> [--starts <ISO time>] [--apply]
  node --env-file=.env scripts/caller-pay.mjs credit --email <login> --amount <dollars> [--paid-on YYYY-MM-DD] [--note "..."] [--apply]

open    Starts (or re-rates) prepaid per-call pay for an allowlisted caller. Calls logged from --starts (default now) are paid.
credit  Adds money to the caller's prepaid balance (a payment you made). Use a negative --amount only to correct a mistake.
Writes preview only until --apply is added. Calls are counted once per lead per Central-time day.`

async function resolveCaller(email) {
  const { adminAuth } = await import('../lib/firebaseAdmin.js')
  const user = await adminAuth().getUserByEmail(email.trim().toLowerCase())
  const allowed = (process.env.ADMIN_EMAIL_ALLOWLIST || '').split(',').map((e) => e.trim().toLowerCase())
  if (user.disabled || !user.email || !allowed.includes(user.email.toLowerCase())) {
    throw new Error(`${email} must be an enabled, allowlisted Firebase user. Nothing was written.`)
  }
  return user
}

function printStatus(pay) {
  console.log(`\n${pay.email} · ${formatUsd(pay.rateCents)}/call · paid since ${new Date(pay.startsAt).toISOString()}`)
  console.log(`  Credited ${formatUsd(pay.creditedCents)} · ${pay.paidCalls} paid calls (${pay.paidCallsToday} today) = ${formatUsd(pay.earnedCents)}`)
  console.log(pay.balanceCents >= 0
    ? `  Balance ${formatUsd(pay.balanceCents)} → ${pay.callsRemaining} calls to go`
    : `  Prepay used up — ${formatUsd(pay.owedCents)} earned past prepay (owed)`)
  for (const p of pay.payments) console.log(`  ${p.paidOn}  +${formatUsd(p.amountCents)}  ${p.note || ''}`)
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      email: { type: 'string' }, rate: { type: 'string' }, starts: { type: 'string' },
      amount: { type: 'string' }, 'paid-on': { type: 'string' }, note: { type: 'string' },
      apply: { type: 'boolean', default: false }, help: { type: 'boolean' },
    },
  })
  const command = positionals[0]
  if (values.help || !['status', 'open', 'credit'].includes(command)) { console.log(usage); return }

  const { getPool, query } = await import('../lib/db.js')
  const store = await import('../lib/payStore.js')
  try {
    if (command === 'status') {
      const ids = values.email
        ? [(await resolveCaller(values.email)).uid]
        : (await query('select caller_id from caller_pay_accounts order by email')).rows.map((r) => r.caller_id)
      if (!ids.length) console.log('No caller pay accounts yet.')
      for (const id of ids) {
        const pay = await store.getPayStatus(id)
        if (pay) printStatus(pay)
        else console.log(`\n${values.email}: no pay account (run "open" first).`)
      }
      return
    }

    if (!values.email) throw new Error(usage)
    const user = await resolveCaller(values.email)

    if (command === 'open') {
      if (!values.rate) throw new Error('--rate is required (dollars per call, e.g. 5).')
      const rateCents = parseUsd(values.rate)
      if (values.starts && Number.isNaN(Date.parse(values.starts))) throw new Error(`Bad --starts time: ${values.starts}`)
      console.log(`${values.apply ? 'Open' : 'Preview'}: ${user.email} (${user.uid}) at ${formatUsd(rateCents)}/call, paid from ${values.starts || 'now'}`)
      if (!values.apply) { console.log('Preview only. Add --apply to save.'); return }
      await store.openPayAccount({ callerId: user.uid, email: user.email, rateCents, startsAt: values.starts })
    }

    if (command === 'credit') {
      if (!values.amount) throw new Error('--amount is required (dollars, e.g. 890).')
      const negative = values.amount.trim().startsWith('-')
      const amountCents = (negative ? -1 : 1) * parseUsd(values.amount.trim().replace(/^-/, ''))
      if (!amountCents) throw new Error('--amount must not be zero.')
      const paidOn = values['paid-on'] || businessDate()
      if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) throw new Error(`Bad --paid-on date: ${paidOn}`)
      console.log(`${values.apply ? 'Credit' : 'Preview'}: ${user.email} ${amountCents > 0 ? '+' : ''}${formatUsd(amountCents)} on ${paidOn}${values.note ? ` — ${values.note}` : ''}`)
      if (!values.apply) { console.log('Preview only. Add --apply to save.'); return }
      const exists = (await query('select 1 from caller_pay_accounts where caller_id = $1', [user.uid])).rows[0]
      if (!exists) throw new Error(`${user.email} has no pay account. Run "open" first. Nothing was written.`)
      await store.recordPayment({ callerId: user.uid, amountCents, paidOn, note: values.note })
    }

    printStatus(await store.getPayStatus(user.uid))
  } finally {
    await getPool().end()
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })
