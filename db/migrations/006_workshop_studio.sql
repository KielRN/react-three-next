-- Preparation only: this migration creates no cohorts, learners or access credentials.
-- All money is integer USD cents. GHL remains registration/payment authority.
create table if not exists workshop_studio_cohorts (
  id uuid primary key default gen_random_uuid(),
  workshop_slug text not null,
  session_starts_at timestamptz not null,
  session_ends_at timestamptz not null,
  access_opens_at timestamptz not null,
  access_expires_at timestamptz not null,
  currency text not null default 'USD' check (currency = 'USD'),
  limit_cents integer not null default 6000 check (limit_cents between 1 and 6000),
  learner_limit_cents integer not null default 500 check (learner_limit_cents between 1 and 500),
  paused boolean not null default true,
  created_at timestamptz not null default now(),
  check (session_ends_at > session_starts_at),
  check (access_opens_at < access_expires_at),
  check (access_expires_at >= session_ends_at and access_expires_at <= session_ends_at + interval '7 days'),
  unique (workshop_slug, session_starts_at)
);

create table if not exists workshop_studio_seats (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references workshop_studio_cohorts(id),
  ghl_calendar_id text not null check (length(ghl_calendar_id) between 1 and 128),
  ghl_registration_id text not null check (length(ghl_registration_id) between 1 and 128),
  ghl_contact_id text not null check (length(ghl_contact_id) between 1 and 128),
  registration_state text not null default 'pending' check (registration_state in ('pending', 'eligible', 'cancelled', 'refunded')),
  paused boolean not null default false,
  revoked_at timestamptz,
  access_version integer not null default 1 check (access_version > 0),
  created_at timestamptz not null default now(),
  unique (ghl_calendar_id, ghl_registration_id),
  unique (id, cohort_id)
);

create table if not exists workshop_studio_jobs (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references workshop_studio_cohorts(id),
  seat_id uuid not null,
  request_key text not null check (length(request_key) between 8 and 128),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  currency text not null default 'USD' check (currency = 'USD'),
  reserved_cents integer not null check (reserved_cents between 1 and 6000),
  state text not null default 'reserved' check (state in ('reserved', 'submitted', 'unknown', 'settled', 'uncharged')),
  actual_cost_cents integer check (actual_cost_cents between 0 and 1000000000),
  provider_job_id text unique check (length(provider_job_id) between 1 and 200),
  incident boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (seat_id, cohort_id) references workshop_studio_seats(id, cohort_id),
  unique (seat_id, request_key),
  check ((state in ('reserved', 'submitted', 'unknown') and actual_cost_cents is null)
    or (state = 'settled' and actual_cost_cents is not null and actual_cost_cents > 0)
    or (state = 'uncharged' and actual_cost_cents is not null and actual_cost_cents = 0))
);
create index if not exists workshop_studio_jobs_cohort on workshop_studio_jobs(cohort_id);

-- Application writes append events in the same transaction as the change.
-- Store billing/registration references, never prompts, tokens or personal content.
create table if not exists workshop_studio_events (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references workshop_studio_cohorts(id),
  seat_id uuid not null references workshop_studio_seats(id),
  job_id uuid references workshop_studio_jobs(id),
  kind text not null check (kind in ('reserved', 'submitted', 'unknown', 'reconciled', 'billing_incident', 'transferred')),
  evidence_reference text check (length(evidence_reference) between 1 and 200),
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create unique index if not exists workshop_studio_events_evidence
  on workshop_studio_events(job_id, kind, evidence_reference) where evidence_reference is not null;
