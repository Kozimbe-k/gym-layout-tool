-- Phase 1 schema: space type ratios + equipment catalog.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists space_types (
  id bigint generated always as identity primary key,
  zone text not null unique,
  area_pct numeric(4, 3) not null check (area_pct > 0 and area_pct <= 1),
  description text
);

create table if not exists equipment (
  id bigint generated always as identity primary key,
  zone text not null references space_types (zone),
  name text not null unique,
  priority int not null,
  length_m numeric(5, 2) not null check (length_m > 0),
  width_m numeric(5, 2) not null check (width_m > 0),
  clearance_m numeric(5, 2) not null default 0 check (clearance_m >= 0),
  unique (zone, priority)
);

-- No public policies yet: the backend uses the service key, which bypasses RLS.
alter table space_types enable row level security;
alter table equipment enable row level security;
