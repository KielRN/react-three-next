-- Task assignments are dated, personal work items. Reimporting a plan is idempotent.
create table if not exists admin_tasks (
  id uuid primary key default gen_random_uuid(),
  task_key text not null,
  assignee_id text not null,
  title text not null,
  instructions text not null,
  due_date date not null check (extract(isodow from due_date) between 1 and 5),
  points integer not null default 100 check (points between 0 and 1000),
  xp integer not null default 25 check (xp between 0 and 200),
  source text not null default '',
  resource_url text not null default '',
  completed_at timestamptz,
  completion_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignee_id, task_key, due_date)
);
create index if not exists admin_tasks_assignee_due_idx on admin_tasks (assignee_id, due_date);

-- Append-only rewards: a task can pay out exactly once, regardless of retries.
create table if not exists task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references admin_tasks(id),
  caller_id text not null,
  points integer not null,
  xp integer not null,
  created_at timestamptz not null default now()
);
create index if not exists task_events_caller_idx on task_events (caller_id, created_at);
