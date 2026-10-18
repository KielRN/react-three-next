-- Keep one task and one completion/reward event, with explicit access for collaborators.
create table if not exists admin_task_assignees (
  task_id uuid not null references admin_tasks(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  primary key (task_id, user_id)
);
create index if not exists admin_task_assignees_user_idx on admin_task_assignees (user_id, task_id);
