-- Saved floor-plan layouts.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists layouts (
  id bigint generated always as identity primary key,
  name text,
  length_m numeric(5, 2) not null,
  width_m numeric(5, 2) not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- No public policies yet: the backend uses the service key, which bypasses RLS.
alter table layouts enable row level security;
