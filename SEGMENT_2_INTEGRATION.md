# Segment 2: Database Schema - Integration Plan

This guide shows how to set up the database schema in your Supabase project.

## What This Segment Provides

**New Files Created:**
- `supabase/migrations/20250101000001_initial_schema.sql` - Profiles table + RLS
- `supabase/migrations/20250101000002_auth_functions.sql` - Triggers and helpers
- `supabase/migrations/20250101000003_admin_setup.sql` - Admin email management
- `lib/supabase/database.types.ts` - TypeScript types for database

**No Existing Files Modified** ✅

## Database Schema Overview

```
┌─────────────────────────────────────────┐
│  auth.users (managed by Supabase)       │
│  ├─ id (UUID)                           │
│  ├─ email                               │
│  ├─ email_confirmed_at                  │
│  └─ ... (other Supabase auth fields)    │
└─────────────────────────────────────────┘
                  │
                  │ Foreign Key
                  ↓
┌─────────────────────────────────────────┐
│  public.profiles (your custom table)    │
│  ├─ id → auth.users.id (FK, PK)        │
│  ├─ email (synced from auth)           │
│  ├─ role ('user' | 'admin')            │
│  ├─ created_at                          │
│  └─ updated_at                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  public.admin_emails                    │
│  ├─ email (PK)                          │
│  ├─ added_at                            │
│  └─ added_by → auth.users.id (FK)      │
└─────────────────────────────────────────┘
```

## What Gets Created

### Tables

1. **profiles** - User profile data
   - Extends `auth.users` with app-specific fields
   - One-to-one relationship (same ID)
   - Automatically created when user signs up
   - Has `user` or `admin` role

2. **admin_emails** - Allowed admin emails
   - Whitelist of emails that get admin role
   - Managed by existing admins
   - Checked during user signup

### Row Level Security (RLS) Policies

- Users can view/update their own profile
- Users cannot change their own role
- Admins can view/update all profiles
- Prevents unauthorized access

### Helper Functions

- `is_admin()` - Check if current user is admin
- `promote_to_admin(user_id)` - Make user an admin
- `demote_to_user(user_id)` - Remove admin role
- `get_my_profile()` - Get current user's profile
- `add_admin_email(email)` - Add email to admin whitelist
- `remove_admin_email(email)` - Remove from whitelist

### Automatic Triggers

- Auto-create profile when user signs up
- Auto-assign admin role if email in whitelist
- Auto-update `updated_at` timestamp

## Integration Steps

### Step 1: Run Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Make sure you're linked to your project
npx supabase db push
```

**Option B: Manual via Dashboard**

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Create new query
4. Copy contents of `supabase/migrations/20250101000001_initial_schema.sql`
5. Paste and click **Run**
6. Repeat for `20250101000002_auth_functions.sql`
7. Repeat for `20250101000003_admin_setup.sql`

### Step 2: Verify Tables Created

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see:
   - `profiles` table
   - `admin_emails` table

### Step 3: Set Up Your First Admin

You need at least one admin to manage the system. Choose one method:

**Method A: Add your email to admin_emails table (Recommended)**

In SQL Editor, run:
```sql
-- Replace with your actual email
insert into public.admin_emails (email)
values ('your-email@example.com');
```

Now when you sign up with that email, you'll automatically get admin role.

**Method B: Manually promote after signup**

1. Sign up with your email first (becomes regular user)
2. In SQL Editor, run:
   ```sql
   -- Get your user ID first
   select id, email from auth.users where email = 'your-email@example.com';

   -- Then promote using that ID
   update public.profiles
   set role = 'admin'
   where id = 'your-user-id-from-above';
   ```

### Step 4: Verify RLS Policies

In Supabase Dashboard:
1. Go to **Authentication** → **Policies**
2. Select `profiles` table
3. You should see all the policies listed

### Step 5: Test the Schema

Run the validation script:
```bash
pnpm tsx scripts/check-supabase-setup.ts
```

Should now show:
```
✅ Environment variables
✅ Connection Test
✅ Database Schema  <-- This should now pass!
✅ Auth Configuration
```

## Integration with Existing Admin System

Your current system uses `ADMIN_EMAILS` environment variable. Here's how this maps:

**Current System:**
```bash
# .env.local
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**New System:**
```sql
-- In Supabase database
insert into public.admin_emails (email) values
  ('admin1@example.com'),
  ('admin2@example.com');
```

### Migration Script for Admin Emails

If you want to import your existing `ADMIN_EMAILS`, create a script:

```typescript
// scripts/import-admin-emails.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function importAdminEmails() {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

  for (const email of adminEmails) {
    const { error } = await supabase
      .from('admin_emails')
      .insert({ email: email.trim() })

    if (error) {
      console.error(`Failed to add ${email}:`, error)
    } else {
      console.log(`✅ Added ${email}`)
    }
  }
}

importAdminEmails()
```

Run with: `pnpm tsx scripts/import-admin-emails.ts`

## File Changes Required

### None for this segment! 🎉

All database changes happen in Supabase, not in your codebase.

The TypeScript types (`database.types.ts`) are new files that you'll use in later segments.

## What's Next

After completing this segment, you'll have:
- ✅ Database tables created
- ✅ Row Level Security enabled
- ✅ Helper functions available
- ✅ Admin system set up
- ✅ TypeScript types ready

Next segments will use this database:
- **Segment 3**: Supabase client utilities (to query these tables)
- **Segment 4**: Auth components (to create/manage users)
- **Segment 5**: API integration (to replace current auth)

## Troubleshooting

### Migration fails: "relation already exists"
The table already exists. Either:
- Drop the table: `drop table public.profiles cascade;`
- Or skip that migration

### RLS policies blocking queries
This is expected! RLS protects your data. You need to:
- Be authenticated (have a valid session)
- Query through the Supabase client (not direct SQL)

### Can't insert into profiles
Don't insert directly! The trigger creates profiles automatically when users sign up.

### Admin role not being assigned
Check:
1. Is the email in `admin_emails` table?
2. Did you run the `20250101000003_admin_setup.sql` migration?
3. Try signing up again (or update profile manually)

## Testing Queries

Once set up, you can test in SQL Editor:

```sql
-- View all profiles
select * from public.profiles;

-- View admin emails
select * from public.admin_emails;

-- Check if you're admin (while authenticated)
select public.is_admin();

-- Get your profile (while authenticated)
select * from public.get_my_profile();
```

## Rollback Plan

To remove the database schema:

```sql
-- Drop tables
drop table if exists public.admin_emails cascade;
drop table if exists public.profiles cascade;

-- Drop functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.promote_to_admin(uuid) cascade;
drop function if exists public.demote_to_user(uuid) cascade;
drop function if exists public.get_my_profile() cascade;
drop function if exists public.add_admin_email(text) cascade;
drop function if exists public.remove_admin_email(text) cascade;

-- Drop enum
drop type if exists user_role cascade;
```

## Notes

- RLS is enabled by default - all queries are secure
- Profiles are auto-created on signup via trigger
- Admin role is auto-assigned if email in whitelist
- TypeScript types match the database schema exactly
- Functions use `security definer` for elevated permissions

## Time Estimate

- **Running migrations**: 2-3 minutes
- **Setting up first admin**: 1 minute
- **Testing**: 2 minutes
- **Total**: ~5 minutes
