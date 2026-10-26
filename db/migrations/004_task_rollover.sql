-- Unfinished work closes as "not done" when its business week ends; a fresh copy restarts the next week.
alter table admin_tasks add column if not exists missed_at timestamptz;
alter table admin_tasks add column if not exists restarted_from uuid references admin_tasks(id);
create index if not exists admin_tasks_open_due_idx on admin_tasks (due_date) where completed_at is null and missed_at is null;
