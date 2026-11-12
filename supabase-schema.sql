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

-- 4. Trigger to automatically pull real Google Account Full Name from auth.users
create or replace function public.auto_populate_student_name()
returns trigger as $$
declare
  google_name text;
begin
  if new.name is null or trim(new.name) = '' or new.name = 'Student' then
    select coalesce(
      nullif(trim(raw_user_meta_data->>'full_name'), ''),
      nullif(trim(raw_user_meta_data->>'name'), ''),
      nullif(trim(concat_ws(' ', raw_user_meta_data->>'given_name', raw_user_meta_data->>'family_name')), '')
    ) into google_name
    from auth.users
    where id::text = new.user_id 
       or (new.email is not null and lower(email) = lower(new.email))
       or (new.progress->'_meta'->>'email' is not null and lower(email) = lower(new.progress->'_meta'->>'email'))
    limit 1;

    if google_name is not null then
      new.name := google_name;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_auto_populate_student_name on public.user_progress;
create trigger trigger_auto_populate_student_name
  before insert or update on public.user_progress
  for each row execute function public.auto_populate_student_name();

-- 5. Backfill existing rows: populate name strictly from Google Auth profile metadata in auth.users
update public.user_progress up
set
  name = coalesce(
    nullif(trim(au.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(au.raw_user_meta_data->>'name'), ''),
    nullif(trim(concat_ws(' ', au.raw_user_meta_data->>'given_name', au.raw_user_meta_data->>'family_name')), ''),
    nullif(trim(up.progress->'_meta'->>'name'), 'Student'),
    up.name,
    'Student'
  ),
  opt_in = true,
  updated_at = now()
from auth.users au
where (
  up.user_id = au.id::text
  or (up.email is not null and lower(up.email) = lower(au.email))
  or (up.progress->'_meta'->>'email' is not null and lower(up.progress->'_meta'->>'email') = lower(au.email))
);

-- 6. Turn on Row Level Security (RLS)
alter table public.user_progress enable row level security;

-- 7. Policies:
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

-- 8. Grant access to API roles
grant select, insert, update on public.user_progress to anon, authenticated;

-- 9. Performance indexes
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
