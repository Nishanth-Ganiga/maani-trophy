-- Run this whole file in Supabase Dashboard → SQL Editor

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null unique,
  owner_name text not null,
  phone text not null,
  place text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  photo_url text not null,
  role text not null check (role in ('wicketkeeper','batsman','bowler','allrounder')),
  jersey_name text not null,
  jersey_size text not null check (jersey_size in ('XXS','XS','S','M','L','XL','XXL','XXXL','XXXXL')),
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.teams   enable row level security;
alter table public.players enable row level security;
alter table public.admins  enable row level security;

-- Public visitors: may only ADD registrations (cannot read them)
create policy "anyone can register team"   on public.teams   for insert to anon, authenticated with check (true);
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
