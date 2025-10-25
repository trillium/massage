# Supabase Setup Guide for Trillium Massage

Complete step-by-step guide to set up Supabase authentication and database.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **Authentication** - Magic links, OAuth, email/password
- **Database** - PostgreSQL with real-time subscriptions
- **Row Level Security** - Database-level access control
- **Auto-generated APIs** - REST and GraphQL endpoints
- **Storage** - File uploads (optional for future)

## Prerequisites

- Node.js 18+ installed
- pnpm installed
- A Supabase account (free tier available)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create a new organization (or use existing)
4. Click "New Project"
5. Fill in project details:
   - **Name**: `trillium-massage` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (upgrade later if needed)
6. Click "Create new project"
7. Wait 2-3 minutes for project to provision

## Step 2: Get Your API Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` public key (safe for browser)
     - `service_role` secret key (server-only, never expose!)

4. Copy these values - you'll add them to `.env.local`

## Step 3: Install Dependencies

Run the installation script:

```bash
bash scripts/install-supabase.sh
```

Or manually install:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D supabase
```

## Step 4: Configure Environment Variables

1. Copy the template:
   ```bash
   cp .env.supabase.template .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Keep your existing environment variables (Google OAuth, PostHog, etc.)

## Step 5: Initialize Supabase CLI (Optional but Recommended)

The Supabase CLI helps manage migrations and local development:

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref your-project-ref

# Your project ref is in the URL: https://app.supabase.com/project/[PROJECT-REF]
```

## Step 6: Run Database Migrations

Apply the schema to create tables:

```bash
# If using CLI (recommended)
npx supabase db push

# OR manually via Supabase Dashboard:
# 1. Go to SQL Editor in Supabase dashboard
# 2. Copy contents of supabase/migrations/001_initial_schema.sql
# 3. Paste and run
# 4. Repeat for 002_auth_functions.sql
```

## Step 7: Configure Auth Settings in Supabase Dashboard

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. **Email Auth**:
   - Enable "Email provider"
   - Enable "Confirm email" (optional - recommended for production)
3. **Email Templates**:
   - Customize magic link email template (optional)
4. **URL Configuration**:
   - Site URL: `http://localhost:3000` (development)
   - Redirect URLs: `http://localhost:3000/auth/callback`
   - For production, add your production URL

## Step 8: Set Up Auth Callback Route

The auth callback handles the redirect after email verification.

1. This is already created in `app/auth/callback/supabase/route.ts`
2. No changes needed - just aware it exists

## Step 9: Test Your Setup

Run the validation script:

```bash
pnpm tsx scripts/check-supabase-setup.ts
```

This will verify:
- Environment variables are set
- Connection to Supabase works
- Database tables exist
- Auth is configured

## Step 10: Understanding the Architecture

```
Your App (Next.js)
├─ Browser (Client Components)
│  └─ Uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
│  └─ User auth state, UI updates
│
├─ Server (Server Components, API Routes)
│  └─ Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
│  └─ Admin operations, server-side auth checks
│
└─ Middleware
   └─ Refreshes auth tokens on each request
   └─ Sets cookies for session management

Supabase Project (Cloud)
├─ Auth Service
│  └─ Handles magic links, sessions, JWT tokens
│
└─ PostgreSQL Database
   ├─ auth.users (managed by Supabase)
   └─ public.profiles (your custom table)
```

## Next Steps

After setup is complete, see the integration guides:
- `SEGMENT_1_INTEGRATION.md` - How to integrate setup into your project
- `SEGMENT_2_INTEGRATION.md` - Database schema integration
- `SEGMENT_3_INTEGRATION.md` - Client utilities integration
- `SEGMENT_4_INTEGRATION.md` - Auth components integration
- `SEGMENT_5_INTEGRATION.md` - API layer integration

## Troubleshooting

### "Failed to fetch" errors
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify project is running in Supabase dashboard

### "Invalid API key" errors
- Double-check you copied the full key
- Make sure you're using `anon` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure you're using `service_role` for `SUPABASE_SERVICE_ROLE_KEY`

### Migration errors
- Check database password is correct
- Verify you're connected to the right project
- Try running migrations manually via SQL Editor

### Auth callback not working
- Check redirect URLs in Supabase dashboard
- Verify `app/auth/callback/supabase/route.ts` exists
- Check browser console for errors

## Security Notes

- **NEVER commit** `.env.local` to git
- **NEVER expose** `SUPABASE_SERVICE_ROLE_KEY` to browser
- Use Row Level Security (RLS) on all tables
- Enable email confirmation in production
- Use httpOnly cookies for sessions (built-in with @supabase/ssr)

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
