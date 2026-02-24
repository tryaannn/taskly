-- ============================================================
-- Taskly — Supabase Database Schema
-- Run this SQL in the Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Tasks table ────────────────────────────────────────────
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  text         text not null check (char_length(text) between 1 and 500),
  priority     text not null check (priority in ('high', 'medium', 'low')) default 'medium',
  completed    boolean not null default false,
  created_at   timestamptz not null default now(),
  completed_at timestamptz,
  due_date     date,
  category     text check (char_length(category) <= 50)
);

-- ── 2. Index for common queries ───────────────────────────────
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_created_at_idx on public.tasks (user_id, created_at desc);

-- ── 3. Row-Level Security (RLS) ────────────────────────────────
--    Users can only read/write their own rows.
alter table public.tasks enable row level security;

-- Allow a user to select only their own tasks
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

-- Allow a user to insert rows only with their own user_id
create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

-- Allow a user to update only their own tasks
create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

-- Allow a user to delete only their own tasks
create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- ── 4. User profiles (optional — extends auth.users) ──────────
--    Supabase stores name inside auth.users.raw_user_meta_data.
--    This table is optional but useful for richer profile data.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
