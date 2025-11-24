-- Fix infinite recursion in profiles RLS policies
-- Replace policies that query profiles table with JWT claim checks

-- Drop existing recursive policies
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- 2. Users can update their own profile (but not role)
-- Use JWT claim instead of querying profiles table
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (auth.jwt() -> 'app_metadata' ->> 'role')::user_role
  );

-- 3. Admins can view all profiles
-- Use JWT claim instead of querying profiles table
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 4. Admins can update any profile
-- Use JWT claim instead of querying profiles table
create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
