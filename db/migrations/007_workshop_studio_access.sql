-- Preparation only. No codes, sessions, cohorts or learners are provisioned.
alter table workshop_studio_jobs add column if not exists owner_access_version integer not null default 1 check (owner_access_version > 0);
alter table workshop_studio_seats add column if not exists ghl_transaction_id text;

-- A transferred registration must never become a new allowance. Keep every
-- registration -> seat association, including references retired by a transfer.
create table if not exists workshop_studio_registration_refs (
  calendar_id text not null,
  registration_id text not null,
  seat_id uuid not null references workshop_studio_seats(id),
  primary key (calendar_id, registration_id)
);
insert into workshop_studio_registration_refs (calendar_id, registration_id, seat_id)
select ghl_calendar_id, ghl_registration_id, id from workshop_studio_seats
on conflict do nothing;

create or replace function workshop_studio_remember_registration() returns trigger as $$
declare existing_seat uuid;
begin
  insert into workshop_studio_registration_refs (calendar_id, registration_id, seat_id)
  values (new.ghl_calendar_id, new.ghl_registration_id, new.id) on conflict do nothing;
  select seat_id into existing_seat from workshop_studio_registration_refs
  where calendar_id = new.ghl_calendar_id and registration_id = new.ghl_registration_id;
  if existing_seat <> new.id then
    raise exception 'Registration already belongs to a studio seat' using errcode = '23505';
  end if;
  return new;
end;
$$ language plpgsql;
drop trigger if exists workshop_studio_registration_history on workshop_studio_seats;
create trigger workshop_studio_registration_history
after insert or update of ghl_calendar_id, ghl_registration_id on workshop_studio_seats
for each row execute function workshop_studio_remember_registration();

create table if not exists workshop_studio_codes (
  id uuid primary key default gen_random_uuid(),
  seat_id uuid not null references workshop_studio_seats(id),
  access_version integer not null check (access_version > 0),
  code_hash text not null unique check (code_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);
create table if not exists workshop_studio_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  seat_id uuid not null references workshop_studio_seats(id),
  access_version integer not null check (access_version > 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index if not exists workshop_studio_sessions_seat on workshop_studio_sessions(seat_id);
