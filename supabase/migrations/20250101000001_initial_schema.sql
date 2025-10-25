-- Initial Schema for Trillium Massage Auth
-- Creates profiles table and sets up Row Level Security

-- Enable UUID extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type user_role as enum ('user', 'admin');

-- Create profiles table
-- This extends auth.users with custom application data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add indexes for common queries
create index profiles_email_idx on public.profiles(email);
create index profiles_role_idx on public.profiles(role);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS Policies for profiles table

-- 1. Users can view their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 2. Users can update their own profile (but not role)
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- 3. Admins can view all profiles
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- 4. Admins can update any profile
create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- 5. Only authenticated users can insert (via trigger, not directly)
create policy "Service role can insert profiles"
  on public.profiles
  for insert
  with check (true);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically update updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Add comments for documentation
comment on table public.profiles is 'User profiles extending auth.users with application-specific data';
comment on column public.profiles.id is 'Foreign key to auth.users.id';
comment on column public.profiles.email is 'User email (synced from auth.users)';
comment on column public.profiles.role is 'User role (user or admin)';
comment on column public.profiles.created_at is 'Timestamp when profile was created';
comment on column public.profiles.updated_at is 'Timestamp when profile was last updated';
