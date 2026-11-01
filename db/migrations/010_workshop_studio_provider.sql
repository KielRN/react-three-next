-- Private provider lifecycle metadata only. No jobs, access or worker are enabled.
alter table workshop_studio_jobs add column if not exists provider_status_url text;
alter table workshop_studio_jobs add column if not exists provider_state text;
alter table workshop_studio_jobs add column if not exists provider_observed_at timestamptz;
alter table workshop_studio_jobs add column if not exists provider_video_url text;
alter table workshop_studio_jobs add column if not exists provider_expires_at timestamptz;

alter table workshop_studio_jobs drop constraint if exists workshop_studio_provider_receipt_check;
alter table workshop_studio_jobs add constraint workshop_studio_provider_receipt_check check (
  (provider_status_url is null and provider_state is null and provider_observed_at is null and provider_video_url is null and provider_expires_at is null)
  or (provider_job_id is not null and submission_claimed_at is not null and provider_status_url is not null and provider_state is not null
    and provider_status_url = 'https://api.higgsfield.ai/requests/' || provider_job_id || '/status'
    and provider_observed_at is not null
    and provider_state in ('queued','in_progress','completed','failed','canceled','nsfw')
    and ((provider_state = 'completed' and provider_video_url is not null and length(provider_video_url) between 1 and 4096)
      or (provider_state <> 'completed' and provider_video_url is null)))
);

alter table workshop_studio_events drop constraint if exists workshop_studio_events_kind_check;
alter table workshop_studio_events add constraint workshop_studio_events_kind_check check (
  kind in ('reserved','submitted','unknown','reconciled','billing_incident','transferred','provider_status')
);
