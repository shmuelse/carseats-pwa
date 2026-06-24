-- Supabase setup for anonymous PWA install analytics.
-- Run this file in Supabase SQL Editor.
-- It allows public clients to INSERT install events, but not SELECT them.
-- Do not store personal data in this table.

create table if not exists public.install_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null default 'pwa_install',
  app_version text,
  platform text,
  display_mode text
);

alter table public.install_events enable row level security;

drop policy if exists "Anyone can report install events" on public.install_events;

create policy "Anyone can report install events"
  on public.install_events
  for insert
  to anon
  with check (event_name = 'pwa_install');

grant insert on public.install_events to anon;

-- Optional admin query, to run in Supabase SQL Editor:
-- select count(*) as installs from public.install_events;

-- Optional breakdown by platform:
-- select platform, count(*) as installs
-- from public.install_events
-- group by platform
-- order by installs desc;
