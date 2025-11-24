-- Fix RLS policy for profile creation
-- Allow the trigger function to insert profiles

-- Drop the existing insert policy
drop policy if exists "Service role can insert profiles" on public.profiles;

-- Create a new policy that allows inserts from the trigger
create policy "Allow trigger to insert profiles"
  on public.profiles
  for insert
  with check (true);

-- Grant insert permission to the authenticated role
grant insert on public.profiles to authenticated;
grant insert on public.profiles to service_role;
