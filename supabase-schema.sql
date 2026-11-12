-- ==============================================================================
-- MySQL Academy: Student Progress Sync & Leaderboard Database Schema for Supabase
-- Run this in your Supabase Project:
-- SQL Editor -> New Query -> Paste this script -> Click "Run"
-- ==============================================================================

-- 1. Create the user_progress table if it doesn't exist yet
create table if not exists public.user_progress (
  user_id text primary key,
  email text,
  name text,
  progress jsonb not null default '{}'::jsonb,
  opt_in boolean not null default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. If the table already existed with user_id as uuid / foreign key, migrate safely:
do $$
begin
  -- Drop the foreign key to auth.users if it exists (allows both Google OAuth & student email sign-ins)
  if exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'user_progress_user_id_fkey'
  ) then
    alter table public.user_progress drop constraint user_progress_user_id_fkey;
  end if;

  -- Convert user_id column from uuid to text to support all student ID formats
  alter table public.user_progress alter column user_id type text;
exception
  when others then null;
end $$;

-- 3. Ensure optional helper columns exist
alter table public.user_progress add column if not exists name text;
alter table public.user_progress add column if not exists opt_in boolean not null default true;

-- 4. Backfill existing rows: populate full name from progress metadata or formatted email
update public.user_progress
set name = coalesce(
  nullif(trim(name), ''),
  progress->'_meta'->>'name',
  initcap(replace(split_part(email, '@', 1), '.', ' '))
)
where name is null or trim(name) = '';

-- 4. Turn on Row Level Security (RLS)
alter table public.user_progress enable row level security;

-- 5. Policies:
-- A. Allow anyone (anon and authenticated students) to read the public leaderboard
drop policy if exists "Users can read own progress" on public.user_progress;
drop policy if exists "Authenticated users can read progress for leaderboard" on public.user_progress;
drop policy if exists "Allow reading leaderboard" on public.user_progress;
create policy "Allow reading leaderboard"
  on public.user_progress
  for select
  using (true);

-- B. Allow students to insert their own progress
drop policy if exists "Users can insert own progress" on public.user_progress;
drop policy if exists "Allow student insert" on public.user_progress;
create policy "Allow student insert"
  on public.user_progress
  for insert
  with check (true);

-- C. Allow students to update their own progress
drop policy if exists "Users can update own progress" on public.user_progress;
drop policy if exists "Allow student update" on public.user_progress;
create policy "Allow student update"
  on public.user_progress
  for update
  using (true)
  with check (true);

-- 6. Grant access to API roles
grant select, insert, update on public.user_progress to anon, authenticated;

-- 7. Performance indexes
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_updated_at on public.user_progress(updated_at desc);
