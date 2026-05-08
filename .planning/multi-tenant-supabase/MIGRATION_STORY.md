# Multi-Tenant Migration Story

## Goal

Move from single-therapist Supabase to a shared project with per-tenant Postgres
schemas. Each tenant is fully isolated, can extend beyond the base template, and
multiple domains can map to one tenant.

---

## Tenants

| Slug               | Scope templates | Notes                        |
| ------------------ | --------------- | ---------------------------- |
| `trillium_massage` | booking         | Google auth, Gmail, Calendar |
| `monica_massage`   | booking         | Google auth, Gmail, Calendar |
| `sarah_music`      | booking         | TBD                          |
| `kendra_tarot`     | TBD             |                              |
| `trillium_devblog` | feedtack        | Submissions, commentary      |

---

## Domain Registry

Domains are routing concerns only — they map to a canonical tenant slug.
Multiple domains per tenant are supported.

```
public.domains
  trilliummassage.la          → trillium_massage
  trilliummassage.vercel.app  → trillium_massage
  musicwithsarahb.com         → sarah_music
  monicamassage.com           → monica_massage
  (devblog domain TBD)        → trillium_devblog
```

At deploy time each site sets `TENANT_SLUG=trillium_massage` — no runtime
domain lookup needed unless doing one-deployment-many-tenants routing.

---

## Schema Structure

```
public schema
  domains        (domain TEXT PK, tenant_slug TEXT)
  tenants        (tenant_slug TEXT PK, created_at)

per-tenant schemas (one Postgres schema per tenant)
  trillium_massage.*
  monica_massage.*
  sarah_music.*
  kendra_tarot.*
  trillium_devblog.*
```

New tenant = `CREATE SCHEMA {slug}` + run applicable template migrations.
Extensions = add tables to `tenants/{slug}/` — zero impact on other tenants.

---

## Scope Templates

### booking

```
google_credentials    Google OAuth tokens (refresh + access)
appointments          Client bookings
slot_holds            Booking slot locks
reviews               Client reviews
admin_emails          Who gets admin access
raffles               Raffle campaigns
raffle_entries        Raffle participants
sandbox_sessions      Demo booking simulator
invoices              (child of appointments via FK)
reminders             (child of appointments via FK)
reminder_logs         (child of reminders via FK)
invoice_audit_log     (child of appointments via FK)
```

### feedtack

```
submissions           User feedback submissions
commentary            Admin notes/triage on submissions
site_content          Per-tenant content (replaces site.json/home.json at runtime)
```

---

## Migration File Structure

```
supabase/migrations/
  shared/
    001_domains_registry.sql        public.domains + public.tenants

  templates/
    booking/
      001_google_credentials.sql
      002_appointments.sql
      003_slot_holds.sql
      004_reviews.sql
      005_admin_emails.sql
      006_raffles.sql
      007_raffle_entries.sql
      008_sandbox_sessions.sql
    feedtack/
      001_submissions.sql
      002_commentary.sql
      003_site_content.sql

  tenants/
    trillium_massage/
      001_init.sql                  CREATE SCHEMA + apply booking template
      002_raffles_extension.sql     Trillium-specific raffle tables (if needed)
    monica_massage/
      001_init.sql                  CREATE SCHEMA + apply booking template
    sarah_music/
      001_init.sql                  CREATE SCHEMA + apply booking template
    kendra_tarot/
      001_init.sql                  CREATE SCHEMA + TBD
    trillium_devblog/
      001_init.sql                  CREATE SCHEMA + apply feedtack template
```

---

## Trillium Data Migration

Trillium's existing data lives in the `public` schema (no tenant key). Must be
moved to `trillium_massage.*` before any other tenant onboards.

```sql
-- 1. Create schema and tables (run template migrations)
CREATE SCHEMA trillium_massage;
-- ... run booking template migrations against trillium_massage schema

-- 2. Copy existing data
INSERT INTO trillium_massage.google_credentials SELECT * FROM public.google_credentials;
INSERT INTO trillium_massage.appointments SELECT * FROM public.appointments;
INSERT INTO trillium_massage.slot_holds SELECT * FROM public.slot_holds;
-- ... etc for all booking tables

-- 3. Verify row counts match

-- 4. Update app env: TENANT_SLUG=trillium_massage

-- 5. Deploy app code pointing at trillium_massage schema

-- 6. Drop old public tables (after verification window)
DROP TABLE public.google_credentials;
DROP TABLE public.appointments;
-- ...
```

**Risk window:** between step 4 (env update) and step 5 (deploy), the old schema
is still live. Deploy atomically — env + code in the same Vercel deploy.

---

## App Code Changes

```
TENANT_SLUG=trillium_massage   ← env var per deployment

All Supabase queries:
  .schema(process.env.TENANT_SLUG)
  -- or SET search_path = trillium_massage at client init
```

---

## New Tenant Onboarding (post-migration)

1. Add row to `public.tenants`
2. Add domain(s) to `public.domains`
3. Run `CREATE SCHEMA {slug}`
4. Run applicable template migrations against the new schema
5. Deploy with `TENANT_SLUG={slug}`
6. Tenant visits `/admin/connect-google` to OAuth in (booking tenants)
