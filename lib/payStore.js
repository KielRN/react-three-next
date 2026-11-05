import { query } from './db.js'
import { summarizePay } from './callerPay.js'
import { TASK_TIME_ZONE, businessDate } from './taskSchedule.js'

// Paid calls = distinct (lead, Central business day) pairs this caller logged since the account started.
const PAID_CALLS_SQL = `
  select count(*)::int as paid_calls,
         count(*) filter (where day = $3::date)::int as paid_calls_today
    from (
      select distinct lead_id, (created_at at time zone '${TASK_TIME_ZONE}')::date as day
        from call_events
       where caller_id = $1 and created_at >= $2
    ) t`

// Returns null when the caller has no pay account (e.g. owners), otherwise the balance summary.
export async function getPayStatus(callerId, today = businessDate()) {
  const account = (await query(
    'select caller_id, email, rate_cents, starts_at from caller_pay_accounts where caller_id = $1',
    [callerId],
  )).rows[0]
  if (!account) return null

  const [calls, payments] = await Promise.all([
    query(PAID_CALLS_SQL, [callerId, account.starts_at, today]),
    query(
      `select amount_cents, paid_on::text as paid_on, note
         from caller_payments where caller_id = $1
        order by paid_on desc, created_at desc`,
      [callerId],
    ),
  ])
  const creditedCents = payments.rows.reduce((sum, p) => sum + p.amount_cents, 0)

  return {
    email: account.email,
    startsAt: account.starts_at,
    ...summarizePay({
      rateCents: account.rate_cents,
      creditedCents,
      paidCalls: calls.rows[0].paid_calls,
      paidCallsToday: calls.rows[0].paid_calls_today,
    }),
    payments: payments.rows.map((p) => ({ amountCents: p.amount_cents, paidOn: p.paid_on, note: p.note })),
  }
}

export async function openPayAccount({ callerId, email, rateCents, startsAt }) {
  const res = await query(
    `insert into caller_pay_accounts (caller_id, email, rate_cents, starts_at)
     values ($1, $2, $3, coalesce($4::timestamptz, now()))
     on conflict (caller_id) do update
       set email = excluded.email, rate_cents = excluded.rate_cents, updated_at = now()
     returning *`,
    [callerId, email, rateCents, startsAt ?? null],
  )
  return res.rows[0]
}

export async function recordPayment({ callerId, amountCents, paidOn, note }) {
  const res = await query(
    `insert into caller_payments (caller_id, amount_cents, paid_on, note)
     values ($1, $2, $3::date, $4) returning *`,
    [callerId, amountCents, paidOn, note ?? null],
  )
  return res.rows[0]
}
