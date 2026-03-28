-- ─────────────────────────────────────────────────────────────
--  Team Job Roster — Supabase Schema
--  Run this in the Supabase SQL Editor for your project.
-- ─────────────────────────────────────────────────────────────

create table employees (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  role   text not null check (role in ('maker', 'approver')),
  status text not null default 'active' check (status in ('active', 'inactive'))
);

create table jobs (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  active boolean not null default true
);

create table roster_assignments (
  id       uuid primary key default gen_random_uuid(),
  date     date not null,
  job_id   uuid not null references jobs(id) on delete cascade,
  maker_id uuid not null references employees(id) on delete cascade,
  -- This unique constraint is required for the upsert onConflict to work
  constraint roster_assignments_date_job_id_key unique (date, job_id)
);

create table leaves (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  constraint leaves_dates_check check (end_date >= start_date)
);

-- ─── Disable RLS (internal tool — no per-user access control needed) ──────────

alter table employees          disable row level security;
alter table jobs               disable row level security;
alter table roster_assignments disable row level security;
alter table leaves             disable row level security;

-- ─── Grant anon role full access (used by the Supabase anon key) ──────────────

grant usage on schema public to anon;

grant select, insert, update, delete on employees          to anon;
grant select, insert, update, delete on jobs               to anon;
grant select, insert, update, delete on roster_assignments to anon;
grant select, insert, update, delete on leaves             to anon;
