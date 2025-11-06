-- Auth Helper Functions and Triggers
-- Automatically creates profiles when users sign up

-- Function to handle new user signup
-- This creates a profile entry when a user is created in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_email text;
  admin_emails text[];
  is_admin boolean;
begin
  -- Get the user's email
  user_email := new.email;

  -- Get admin emails from environment
  -- You'll set this in Supabase dashboard: Settings → Database → Secrets
  -- For now, we'll default to checking if email matches pattern
  -- Later you can set: ADMIN_EMAILS secret in Supabase

  -- Check if user should be admin
  -- This is a simple check - in production, use a proper admin list
  is_admin := false;

  -- You can uncomment this when you set up the ADMIN_EMAILS secret:
  -- admin_emails := string_to_array(current_setting('app.settings.admin_emails', true), ',');
  -- is_admin := user_email = any(admin_emails);

  -- Insert profile
  insert into public.profiles (id, email, role)
  values (
    new.id,
    user_email,
    case when is_admin then 'admin'::user_role else 'user'::user_role end
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Function to promote user to admin (admin-only)
create or replace function public.promote_to_admin(user_id uuid)
returns void as $$
begin
  -- Check if caller is admin
  if not public.is_admin() then
    raise exception 'Only admins can promote users';
  end if;

  -- Update user role
  update public.profiles
  set role = 'admin'
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Function to demote admin to user (admin-only)
create or replace function public.demote_to_user(user_id uuid)
returns void as $$
begin
  -- Check if caller is admin
  if not public.is_admin() then
    raise exception 'Only admins can demote users';
  end if;

  -- Prevent demoting yourself
  if user_id = auth.uid() then
    raise exception 'You cannot demote yourself';
  end if;

  -- Update user role
  update public.profiles
  set role = 'user'
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Function to get current user profile
create or replace function public.get_my_profile()
returns table (
  id uuid,
  email text,
  role user_role,
  created_at timestamptz,
  updated_at timestamptz
) as $$
begin
  return query
  select p.id, p.email, p.role, p.created_at, p.updated_at
  from public.profiles p
  where p.id = auth.uid();
end;
$$ language plpgsql security definer;

-- Add comments
comment on function public.handle_new_user() is 'Automatically creates profile when user signs up';
comment on function public.is_admin() is 'Returns true if current user is an admin';
comment on function public.promote_to_admin(uuid) is 'Promotes a user to admin role (admin-only)';
comment on function public.demote_to_user(uuid) is 'Demotes an admin to user role (admin-only)';
comment on function public.get_my_profile() is 'Returns current user profile';
