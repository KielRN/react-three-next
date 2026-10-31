-- No provider request is made by this migration. A claim is durable BEFORE a
-- future paid POST; process/network uncertainty must never permit a blind retry.
alter table workshop_studio_jobs add column if not exists submission_claimed_at timestamptz;
