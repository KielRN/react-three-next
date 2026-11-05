-- Prepaid per-call pay for contract callers (e.g. Sam at $5/call).
-- Opt-in: only callers with a pay account see a balance on Mission Control.
-- Numbered 012 so it sorts after the workshop-studio branch's 006–011 when that merges.

create table if not exists caller_pay_accounts (
  caller_id   text primary key,            -- Firebase UID (same key as call_events.caller_id)
  email       text not null,
  rate_cents  int not null check (rate_cents > 0),
  starts_at   timestamptz not null default now(),  -- calls logged from here on are paid
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists caller_payments (
  id            uuid primary key default gen_random_uuid(),
  caller_id     text not null references caller_pay_accounts(caller_id) on delete cascade,
  amount_cents  int not null check (amount_cents <> 0),  -- credited toward the call balance
  paid_on       date not null,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists caller_payments_caller_idx on caller_payments (caller_id, paid_on);
