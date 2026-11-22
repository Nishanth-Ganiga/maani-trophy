-- Run this whole file in Supabase Dashboard → SQL Editor

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  slot smallint unique check (slot between 1 and 16),
  team_name text not null unique,
  owner_name text,
  phone text,
  place text,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  photo_url text not null,
  role text not null check (role in ('wicketkeeper','batsman','bowler','allrounder')),
  jersey_name text not null,
  jersey_size text not null check (jersey_size in ('XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL')),
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- If you already created the players table earlier, this adds the new phone column:
alter table public.players add column if not exists phone text;

alter table public.teams   enable row level security;
alter table public.players enable row level security;
alter table public.admins  enable row level security;

-- Table access (needed on newer Supabase projects, otherwise: "permission denied for table")
grant usage on schema public to anon, authenticated;
grant insert on public.players to anon, authenticated;
grant select, insert, update, delete on public.teams to authenticated;
grant select, update, delete on public.players to authenticated;
grant select on public.admins to authenticated;

-- Public visitors: may only ADD player registrations (cannot read them)
-- Team registration is CLOSED to the public: only the admin can add/edit teams (see the admin policy below)
create policy "anyone can register player" on public.players for insert to anon, authenticated with check (true);

-- Admins: full access
create policy "admin all teams"   on public.teams   for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "admin all players" on public.players for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
create policy "admin sees self" on public.admins for select to authenticated using (user_id = auth.uid());

-- Player photos: public bucket, max 2 MB, PNG/JPEG only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-photos', 'player-photos', true, 2097152, array['image/png','image/jpeg'])
on conflict (id) do nothing;

create policy "anyone can upload player photo" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'player-photos');
create policy "admin can delete player photo" on storage.objects for delete to authenticated
  using (bucket_id = 'player-photos' and exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- After creating your admin user (Authentication → Users → Add user), run:
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL';

-- ---- If your tables already exist, run THIS block once to close team registration + enable the 16 team slots ----
-- alter table public.teams add column if not exists slot smallint unique check (slot between 1 and 16);
-- alter table public.teams alter column owner_name drop not null;
-- alter table public.teams alter column phone drop not null;
-- alter table public.teams alter column place drop not null;
-- drop policy if exists "anyone can register team" on public.teams;
-- revoke insert on public.teams from anon;
-- grant select, insert, update, delete on public.teams to authenticated;
