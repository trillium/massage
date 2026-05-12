# Multi-Tenant Onboarding Guide

Each tenant gets their own isolated Postgres schema on a shared Supabase project, their own Vercel deployment, and their own Google account connected for Calendar + Gmail.

---

## Architecture

```
Single Supabase project (qrvuazoacpolbojkimyu)
  ├── public schema     — shared auth (profiles, tenants, domains)
  ├── trillium_massage/ — Trillium's data
  ├── sarah_music/      — Sarah's data
  └── <new_tenant>/     — auto-provisioned on first boot
```

---

## Adding a New Tenant

### Step 1 — Configure env vars

Create a new Vercel deployment (fork or deploy from this repo) with:

```bash
# Shared Supabase project — same for all tenants
NEXT_PUBLIC_SUPABASE_URL=https://qrvuazoacpolbojkimyu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<shared anon key>
SUPABASE_SERVICE_ROLE_KEY=<shared service role key>

# Tenant identity
TENANT_SLUG=<snake_case_slug>          # e.g. sarah_music
NEXT_PUBLIC_TENANT_SLUG=<snake_case_slug>
TENANT_DOMAIN=<their-domain.com>

# Owner — this email gets admin role on first signup
OWNER_EMAIL=<owner@their-domain.com>
OWNER_NAME=<Full Name>
OWNER_PHONE_NUMBER=<1-XXX-XXX-XXXX>

# Shared Google OAuth (Trillium's app)
GOOGLE_OAUTH_CLIENT_ID=<shared client id>
GOOGLE_OAUTH_SECRET=<shared client secret>
GOOGLE_MAPS_API_KEY=<shared maps key>

# Site
NEXT_PUBLIC_SITE_URL=https://<their-domain.com>
```

### Step 2 — Register OAuth callbacks

**Google Cloud Console** → Trillium's OAuth client → Authorized redirect URIs, add:

```
https://<their-domain.com>/auth/callback/connect-google
```

**Supabase Dashboard** → Auth → URL Configuration → Redirect URLs, add:

```
https://<their-domain.com>/auth/callback/supabase
```

### Step 3 — Deploy

On first request, `provisionTenant()` runs automatically and:

1. Creates the tenant schema with all tables
2. Seeds `OWNER_EMAIL` into `<slug>.admin_emails`
3. Exposes the schema via PostgREST

Fully idempotent — safe to redeploy at any time.

---

## Owner Login Flow

Once deployed, the tenant owner:

1. Goes to `https://<their-domain>/auth/login`
2. Signs up with their `OWNER_EMAIL`
3. The `handle_new_user` trigger finds their email in `admin_emails` → `role = 'admin'`
4. They land in the admin area — no manual SQL needed

### Connect Google Calendar & Gmail

From the admin area:

1. Go to `/admin/connect-google`
2. Click Connect — OAuth flow runs through the shared Google app
3. Tokens saved to `<slug>.google_credentials` keyed by their Google account email
4. Calendar sync and Gmail confirmation emails are now active

---

## Running Migrations

When new migrations are added to `supabase/migrations/`, apply them to the shared project:

```bash
# One-time setup
supabase login --token <token-from-supabase.com/dashboard/account/tokens>
supabase link --project-ref qrvuazoacpolbojkimyu

# Apply pending migrations
pnpm db:migrate
```

Migrations automatically apply to all tenants (they use `CREATE TABLE IF NOT EXISTS`, `CREATE SCHEMA IF NOT EXISTS`, etc.).

---

## Tenant Registry

| Slug               | Domain              | Status |
| ------------------ | ------------------- | ------ |
| `trillium_massage` | trilliummassage.la  | Active |
| `sarah_music`      | musicwithsarahb.com | Active |
