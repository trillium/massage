-- Setup Admin User for trilliummassagela@gmail.com
-- Run this in Supabase SQL Editor

-- 1. Check current user status
SELECT id, email, role, created_at
FROM public.profiles
WHERE email = 'trilliummassagela@gmail.com';

-- 2. Check if email is in admin_emails table
SELECT * FROM public.admin_emails
WHERE email = 'trilliummassagela@gmail.com';

-- 3. Promote user to admin (run this if user exists but role is 'user')
-- This bypasses RLS by using a DO block
DO $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'::user_role
  WHERE email = 'trilliummassagela@gmail.com';
END $$;

-- 4. Verify the update worked
SELECT email, role FROM public.profiles
WHERE email = 'trilliummassagela@gmail.com';
