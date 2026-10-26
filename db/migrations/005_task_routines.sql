-- Daily routines appear every business day, expire at the end of their day, and score on a streak.
alter table admin_tasks add column if not exists routine boolean not null default false;

create table if not exists task_routines (
  assignee_id text not null,
  task_key text not null,
  title text not null,
  instructions text not null,
  points integer not null check (points between 0 and 1000),
  xp integer not null check (xp between 0 and 200),
  source text not null default '',
  resource_url text not null default '',
  -- [{ "userId": "...", "displayName": "..." }] linked to every generated task.
  shared_with jsonb not null default '[]',
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (assignee_id, task_key)
);

-- Once-per-week rewards such as a perfect routine week. Paid to the routine owner.
create table if not exists task_bonuses (
  id uuid primary key default gen_random_uuid(),
  caller_id text not null,
  week_id text not null,
  kind text not null,
  points integer not null,
  xp integer not null,
  created_at timestamptz not null default now(),
  unique (caller_id, week_id, kind)
);
