-- Admin Setup Helper
-- Run this manually after migrations to set up admin emails

-- This file provides instructions and helper SQL for setting up admin emails
-- Since Supabase doesn't support reading environment variables directly in SQL,
-- we'll use a custom approach

-- Option 1: Manual Admin Promotion
-- After a user signs up, manually promote them to admin:
-- Example:
-- select public.promote_to_admin('user-uuid-here');

-- Option 2: Update the trigger to check specific emails
-- Modify the handle_new_user() function to check against specific emails:

-- Example modification (uncomment and customize):
/*
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_email text;
  is_admin boolean;
begin
  user_email := new.email;

  -- Check if email is in admin list
  is_admin := user_email in (
    'your-admin-email@example.com',
    'another-admin@example.com'
  );

  insert into public.profiles (id, email, role)
  values (
    new.id,
    user_email,
    case when is_admin then 'admin'::user_role else 'user'::user_role end
  );

  return new;
end;
$$ language plpgsql security definer;
*/

-- Option 3: Create an admin emails table
create table if not exists public.admin_emails (
  email text primary key,
  added_at timestamptz not null default now(),
  added_by uuid references auth.users(id)
);

-- Enable RLS on admin_emails
alter table public.admin_emails enable row level security;

-- Only admins can view admin emails list
create policy "Admins can view admin emails"
  on public.admin_emails
  for select
  using (public.is_admin());

-- Only admins can add admin emails
create policy "Admins can insert admin emails"
  on public.admin_emails
  for insert
  with check (public.is_admin());

-- Only admins can remove admin emails
create policy "Admins can delete admin emails"
  on public.admin_emails
  for delete
  using (public.is_admin());

-- Update handle_new_user to check admin_emails table
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_email text;
  is_admin boolean;
begin
  user_email := new.email;

  -- Check if email is in admin_emails table
  is_admin := exists (
    select 1 from public.admin_emails
    where email = user_email
  );

  insert into public.profiles (id, email, role)
  values (
    new.id,
    user_email,
    case when is_admin then 'admin'::user_role else 'user'::user_role end
  );

  return new;
end;
$$ language plpgsql security definer;

-- Add your initial admin emails here:
-- insert into public.admin_emails (email) values ('your-email@example.com');

-- Helper function to add admin email (admin-only)
create or replace function public.add_admin_email(admin_email text)
returns void as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can add admin emails';
  end if;

  insert into public.admin_emails (email, added_by)
  values (admin_email, auth.uid());
end;
$$ language plpgsql security definer;

-- Helper function to remove admin email (admin-only)
create or replace function public.remove_admin_email(admin_email text)
returns void as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can remove admin emails';
  end if;

  delete from public.admin_emails
  where email = admin_email;
end;
$$ language plpgsql security definer;

comment on table public.admin_emails is 'List of emails that should be granted admin access';
comment on function public.add_admin_email(text) is 'Add an email to the admin list (admin-only)';
comment on function public.remove_admin_email(text) is 'Remove an email from the admin list (admin-only)';
