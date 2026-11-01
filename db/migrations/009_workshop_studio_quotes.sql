-- Private, server-issued account-estimate records. No quotes or learners seeded.
create table if not exists workshop_studio_quotes (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references workshop_studio_cohorts(id),
  seat_id uuid not null,
  access_version integer not null check (access_version > 0),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  request_data jsonb not null check (jsonb_typeof(request_data) = 'object'),
  provider_payload jsonb not null check (jsonb_typeof(provider_payload) = 'object'),
  currency text not null default 'USD' check (currency = 'USD'),
  maximum_cost_cents integer not null check (maximum_cost_cents between 1 and 500),
  source text not null default 'higgsfield_account_estimate' check (source = 'higgsfield_account_estimate'),
  provider_correlation_id text not null check (length(provider_correlation_id) between 1 and 200),
  estimated_at timestamptz not null,
  expires_at timestamptz not null,
  bound_job_id uuid unique references workshop_studio_jobs(id),
  foreign key (seat_id, cohort_id) references workshop_studio_seats(id, cohort_id),
  check (expires_at > estimated_at and expires_at <= estimated_at + interval '5 minutes')
);
alter table workshop_studio_jobs add column if not exists quote_id uuid references workshop_studio_quotes(id);
create unique index if not exists workshop_studio_jobs_quote on workshop_studio_jobs(quote_id) where quote_id is not null;
