-- Fix OAuth "user_role does not exist" error
-- Run this in Supabase SQL Editor

-- Check if function exists and what it looks like
SELECT
  'Checking handle_new_user function...' as status,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'handle_new_user';

-- If the above returns nothing, the function doesn't exist
-- If it returns something, check if it has proper schema qualification

-- SOLUTION: Recreate the function with explicit schema qualification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  is_admin boolean;
BEGIN
  user_email := new.email;
  is_admin := false;

  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    user_email,
    CASE WHEN is_admin THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Verify the trigger exists
SELECT 'Checking trigger...' as status, tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Test it's working
SELECT 'Setup complete! Trigger and function recreated with explicit schema paths.' as result;
