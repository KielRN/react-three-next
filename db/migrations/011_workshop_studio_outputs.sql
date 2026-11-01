-- Private bounded copies in the existing database. No data/access is seeded.
create table if not exists workshop_studio_outputs (
  job_id uuid primary key references workshop_studio_jobs(id),
  owner_access_version integer not null check (owner_access_version > 0),
  content_type text not null default 'video/mp4' check (content_type = 'video/mp4'),
  byte_count integer not null check (byte_count between 12 and 16777216),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  contents bytea not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  check (octet_length(contents) = byte_count),
  check (expires_at > created_at)
);
create index if not exists workshop_studio_outputs_expiry on workshop_studio_outputs(expires_at);
alter table workshop_studio_events drop constraint if exists workshop_studio_events_kind_check;
alter table workshop_studio_events add constraint workshop_studio_events_kind_check check (
  kind in ('reserved','submitted','unknown','reconciled','billing_incident','transferred','provider_status','output_stored','output_purged')
);
