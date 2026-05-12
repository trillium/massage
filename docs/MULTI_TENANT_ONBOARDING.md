# Multi-Tenant Onboarding Guide

This app supports multiple tenants sharing a single Supabase project via schema-per-tenant. Each tenant gets their own isolated Postgres schema (e.g. `sarah_music`, `trillium_massage`) with full table separation and RLS.

---

## Architecture

```
Single Supabase project (qrvuazoacpolbojkimyu)
  ├── public schema          — shared auth (profiles, tenants, domains registry)
  ├── trillium_massage/      — Trillium's data
  ├── sarah_music/           — Sarah's data
  └── <new_tenant>/          — provisioned automatically on first boot
```

Each tenant gets their own Vercel deployment pointing at the shared Supabase project, with `TENANT_SLUG` selecting their schema.

---

## Provisioning a New Tenant

### Step 1 — Vercel Deployment

Fork or deploy this repo with the following env vars:

```
# Shared Supabase project (same for all tenants)
NEXT_PUBLIC_SUPABASE_URL=https://qrvuazoacpolbojkimyu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<shared anon key>
SUPABASE_SERVICE_ROLE_KEY=<shared service role key>

# Tenant identity
TENANT_SLUG=sarah_music                  # must be snake_case, lowercase
NEXT_PUBLIC_TENANT_SLUG=sarah_music
TENANT_DOMAIN=musicwithsarahb.com        # optional, registers in domains table

# Owner identity — CRITICAL for admin auto-provisioning
OWNER_EMAIL=sarah@musicwithsarahb.com   # this email gets admin on first signup
OWNER_NAME=Sarah B
OWNER_PHONE_NUMBER=1-XXX-XXX-XXXX

# Shared Google OAuth (Trillium's OAuth app)
GOOGLE_OAUTH_CLIENT_ID=<shared client id>
GOOGLE_OAUTH_SECRET=<shared client secret>
GOOGLE_MAPS_API_KEY=<shared maps key>

# Site
NEXT_PUBLIC_SITE_URL=https://musicwithsarahb.com
```

### Step 2 — Add Redirect URI to Google OAuth Client

In the Google Cloud Console, add to the authorized redirect URIs on Trillium's OAuth client:

```
https://<tenant-domain>/auth/callback/connect-google
```

Also add to Supabase Auth → URL Configuration → Redirect URLs:

```
https://<tenant-domain>/auth/callback/supabase
```

### Step 3 — Deploy

On first request after deploy, `provisionTenant()` fires automatically and:

1. Calls `create_tenant(slug, domain, owner_email)` — creates the schema and all tables
2. Seeds `OWNER_EMAIL` into `<tenant_slug>.admin_emails`
3. Appends the schema to PostgREST's allowed schema list

This is fully idempotent — safe to redeploy.

---

## Admin Login Flow (Tenant Owner)

Once deployed, the tenant owner:

1. Goes to `https://<their-domain>/auth/login`
2. Signs up with their `OWNER_EMAIL`
3. The `handle_new_user` trigger fires, finds their email in `<tenant_slug>.admin_emails`, and sets `role = 'admin'` automatically
4. They land in the admin area

**No manual SQL or Trillium intervention needed.**

### Connect Google Calendar & Gmail

After logging in:

1. Go to `/admin/connect-google`
2. Click Connect — OAuth flow runs through the shared Google OAuth app
3. Tokens are saved to `<tenant_slug>.google_credentials` keyed by `OWNER_EMAIL`
4. Calendar and Gmail now work scoped to their Google account

---

## Applying Database Migrations

Migrations in `supabase/migrations/` must be applied to the shared Supabase project whenever new ones are added. Two methods:

### Via project script (preferred)

```bash
# Authenticate once (only needed if not already logged in)
supabase login --token <token-from-supabase.com/dashboard/account/tokens>

# Link to the shared project (only needed once)
supabase link --project-ref qrvuazoacpolbojkimyu

# Push all pending migrations
pnpm db:migrate
```

### Via Supabase Dashboard

Open the SQL editor at `supabase.com/dashboard/project/qrvuazoacpolbojkimyu` and run migration files from `supabase/migrations/` in order.

---

## Pending Migrations (as of 2026-05-12)

These migrations are committed but not yet applied to the live DB:

| File                                            | What it does                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `20260512000001_tenant_aware_admin_trigger.sql` | Rewrites `handle_new_user()` to fan out across tenant schemas and auto-grant admin from `admin_emails` |
| `20260512000002_create_tenant_owner_email.sql`  | Adds `p_owner_email` param to `create_tenant`, seeds `admin_emails`, exposes schema in PostgREST       |

Until these are applied, the manual workaround for existing tenants is:

```sql
INSERT INTO <tenant_slug>.admin_emails (email) VALUES ('<owner-email>');
-- Then after the user signs up:
UPDATE public.profiles SET role = 'admin' WHERE email = '<owner-email>';
```

---

## Tenant Registry

| Tenant slug        | Domain              | Status                                 |
| ------------------ | ------------------- | -------------------------------------- |
| `trillium_massage` | trilliummassage.la  | Active                                 |
| `sarah_music`      | musicwithsarahb.com | Schema provisioned, migrations pending |
