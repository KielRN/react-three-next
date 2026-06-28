-- Admin Calling Dashboard schema. All tables carry caller_id to seam multi-caller later.

create extension if not exists "pgcrypto";  -- for gen_random_uuid()

create table if not exists leads (
  id             uuid primary key default gen_random_uuid(),
  week_id        text not null,
  business       text not null,
  owner          text,
  phone          text not null,
  address        text,
  rating         numeric,
  reviews_count  int,
  last_review    text,
  competitor     text,
  context        jsonb,
  status         text not null default 'not_called',
  notes          text,
  won            boolean not null default false,
  won_tier       text,
  caller_id      text not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (week_id, business, phone)
);
create index if not exists leads_week_status_idx on leads (week_id, status);

create table if not exists call_events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references leads(id) on delete cascade,
  caller_id   text not null,
  event_type  text not null,            -- 'call_completed' | 'outcome_set' | 'won'
  outcome     text,
  tier        text,
  points      int not null default 0,
  xp          int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists call_events_caller_idx on call_events (caller_id, created_at);
create index if not exists call_events_lead_idx on call_events (lead_id);

create table if not exists player_profile (
  caller_id      text primary key,
  avatar_id      text,
  lifetime_xp    bigint not null default 0,
  level          int not null default 1,
  rank           text not null default 'Cadet',
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_day date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
