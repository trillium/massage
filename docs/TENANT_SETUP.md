# Tenant Setup Guide

This app is designed to be forked — each practitioner runs their own deployment with their own Supabase project, Google account, and Vercel project. There is no shared infrastructure between tenants.

## Architecture Model

Each tenant gets:

- Their own Vercel deployment (their own domain)
- Their own Supabase project (their own database, auth, storage)
- Their own Google Cloud project (their own Calendar, Gmail, Maps access)
- A fork of this repo with their content customized

Tenants do **not** share a database. The `TENANT_SLUG` / `NEXT_PUBLIC_TENANT_SLUG` env vars exist for Postgres schema separation within a single Supabase project (used during development/testing), but in production each tenant has a fully separate Supabase project.

---

## Setup Phases

### Phase 1 — Fork and Customize Content

**1. Fork the repo**

**2. Edit `data/siteConfig.json`** — this is the primary content file:

```json
{
  "business": {
    "name": "Your Business Name",
    "ownerName": "Your Name",
    "occupation": "Massage Therapist",
    "tagline": "Your tagline",
    "description": "Full description for SEO"
  },
  "contact": {
    "email": "your@gmail.com",
    "phone": "1-XXX-XXX-XXXX",
    "instagram": "https://www.instagram.com/yourhandle"
  },
  "domain": {
    "siteUrl": "https://yourdomain.com/"
  },
  "location": {
    "city": "Your City",
    "state": "CA",
    "display": "Your City, CA",
    "neighborhood": "Your Neighborhood",
    "serviceArea": "Serving the X Area",
    "mapLatitude": 34.05,
    "mapLongitude": -118.25
  },
  "scheduling": {
    "timezone": "America/Los_Angeles",
    "leadTimeMinutes": 180,
    "appointmentIntervalMinutes": 30,
    "defaultDuration": 90,
    "allowedDurations": [60, 90, 120],
    "workdays": {
      "0": { "startHour": 10, "endHour": 22 },
      "1": { "startHour": 10, "endHour": 22 }
    }
  },
  "pricing": {
    "baseHourlyRate": 140
  },
  "calendars": ["primary"],
  "payments": [
    { "name": "Cash", "value": "cash", "hint": "..." },
    { "name": "Venmo", "value": "venmo", "hint": "Venmo: @yourhandle" }
  ]
}
```

Key fields:

- `scheduling.workdays` — keys are 0-6 (Sunday-Saturday). Omit days you don't work.
- `scheduling.timezone` — must be a valid IANA timezone string.
- `calendars` — list of Google Calendar IDs to check for busy times. `"primary"` means your main Google Calendar. Add additional calendars you want blocked (e.g., a personal calendar).
- `pricing.baseHourlyRate` — used as the default rate; individual slug configs can override.

**3. Replace images** in `public/static/images/`:

- `avatar.jpg` — your profile photo
- `logo.svg` — your logo
- `twitter-card.jpg` — social share image (1200×630px)

**4. Configure booking slugs** in `lib/slugConfigurations/fetchSlugConfigurationData.ts`. Each slug defines a booking page URL and its rules. See existing configs as examples. At minimum, create one default slug for your main booking page.

---

### Phase 2 — Supabase

**1. Create a new Supabase project** at [supabase.com](https://supabase.com). Note the project URL and keys.

**2. Run migrations** — from the repo root:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or apply them manually in the Supabase SQL editor in order from `supabase/migrations/`.

**3. Add your admin email** — run this SQL in the Supabase SQL editor:

```sql
insert into admin_emails (email) values ('your@email.com');
```

This pre-approves your email so that when you sign up, you are automatically given the `admin` role.

**4. Enable Realtime** on the `slot_holds` table:

- In Supabase dashboard → Database → Replication → enable `slot_holds`

**5. Get your keys** from Supabase → Settings → API:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Phase 3 — Google Cloud

You need a Google Cloud project to access Calendar, Gmail, and Maps.

**1. Create a project** at [console.cloud.google.com](https://console.cloud.google.com)

**2. Enable APIs:**

- Google Calendar API
- Gmail API
- Maps JavaScript API
- Maps Embed API

**3. Create OAuth 2.0 credentials:**

- APIs & Services → Credentials → Create Credentials → OAuth client ID
- Application type: Web application
- Authorized redirect URIs — add both:
  - `https://yourdomain.com/auth/callback/connect-google`
  - `http://localhost:9876/auth/callback/connect-google`
- Download or note the **Client ID** and **Client Secret**

**4. Create an API key** (for Maps):

- APIs & Services → Credentials → Create Credentials → API key
- Restrict it to Maps APIs only

**5. Find your primary Calendar ID:**

- Go to [calendar.google.com](https://calendar.google.com) → Settings → select your calendar → scroll to "Calendar ID"
- It will look like `yourname@gmail.com` or a long string ending in `@group.calendar.google.com`
- This goes in `siteConfig.json` under `calendars`

**6. Set these env vars:**

```
GOOGLE_OAUTH_CLIENT_ID=<client id from step 3>
GOOGLE_OAUTH_SECRET=<client secret from step 3>
GOOGLE_MAPS_API_KEY=<api key from step 4>
```

**7. Connect your Google account** — after deploying, go to `/admin/connect-google` and authorize. This stores your OAuth tokens in the database. The app uses these tokens to read/write your calendar and send Gmail.

> `OWNER_EMAIL` must match the Google account you connect at `/admin/connect-google`. The app loads your credentials by looking up this email in the database.

---

### Phase 4 — Environment Variables

Create `.env.local` from `.env.example`. Required variables:

**Supabase:**

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Google:**

```
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_SECRET=GOCSPX-xxx
GOOGLE_MAPS_API_KEY=AIza...
```

**Owner identity** — must match the Google account you'll connect:

```
OWNER_EMAIL=your@gmail.com
OWNER_NAME=Your Name
OWNER_PHONE_NUMBER=1-XXX-XXX-XXXX
```

**Site:**

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Notifications (optional but recommended):**

```
PUSHOVER_API_KEY=xxx
PUSHOVER_USER_KEY=xxx
```

Pushover sends push notifications to your phone when a booking comes in. Get keys at [pushover.net](https://pushover.net).

**Analytics (optional):**

```
NEXT_PUBLIC_POSTHOG_KEY_PROD=phc_xxx
NEXT_PUBLIC_POSTHOG_KEY_DEV=phc_xxx
```

Use separate PostHog projects for dev and prod, or set `NEXT_PUBLIC_DISABLE_POSTHOG=true` to turn it off.

**Security:**

```
UPDATE_LOC_PASSWORD=<random string>
REMINDER_CRON_SECRET=<random string>
```

Generate with `openssl rand -base64 32`.

---

### Phase 5 — Vercel Deployment

**1. Import repo** into Vercel

**2. Set all env vars** from `.env.local` in the Vercel project settings (Settings → Environment Variables). Mark `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_SECRET`, `REMINDER_CRON_SECRET`, and `UPDATE_LOC_PASSWORD` as sensitive.

**3. Deploy**

**4. After first deploy:**

- Go to `https://yourdomain.com/auth/login`
- Sign up with the email you added to `admin_emails`
- Go to `https://yourdomain.com/admin/connect-google`
- Connect your Google account — this stores your OAuth tokens in the database
- Go to `https://yourdomain.com/admin` to verify admin access

---

## Admin Access

Admin status is determined by the `role` column in the `profiles` table. A user gets `role = 'admin'` automatically on signup if their email exists in the `admin_emails` table.

To promote an existing user after the fact, run in the Supabase SQL editor:

```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

Admin routes (`/admin/*`) redirect to `/admin` if you are not an admin. API routes return 401.

---

## Google Credentials Flow

```
/admin/connect-google
  → click Connect
  → Google OAuth consent screen
  → /auth/callback/connect-google?code=...
  → tokens saved to google_credentials table (keyed by OWNER_EMAIL)
  → app uses these tokens for all Calendar and Gmail operations
```

Tokens are stored in the `google_credentials` table and auto-refreshed as needed. If you ever revoke access or rotate credentials, go back to `/admin/connect-google` to reconnect.

---

## Payment Methods

Edit the `payments` array in `siteConfig.json`. Each entry has:

- `name` — display name shown to client
- `value` — internal identifier
- `hint` — helper text shown in the booking form (e.g., your Venmo handle)

The app does not process payments — it collects the client's payment method preference and you collect payment in person or separately.

---

## Pre-Deploy Checklist

Run through this before triggering a first deploy for a new tenant. Catches the class of error where a build succeeds but ships a broken artifact (e.g. a placeholder Supabase URL baked into the JS bundle).

```bash
# Verify Vercel env vars are set and non-placeholder
vercel env ls --environment=production | grep -E 'SUPABASE|GOOGLE|OWNER'
```

Check each line against this table:

| Variable                        | Expected format                            | Common mistake                      |
| ------------------------------- | ------------------------------------------ | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://<ref>.supabase.co`                | Left as `placeholder.supabase.co`   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | starts with `eyJ`, >100 chars              | Copied service role key by mistake  |
| `SUPABASE_SERVICE_ROLE_KEY`     | starts with `eyJ`, >100 chars              | Left blank                          |
| `GOOGLE_OAUTH_CLIENT_ID`        | ends with `.apps.googleusercontent.com`    | Wrong project's client ID           |
| `GOOGLE_OAUTH_SECRET`           | starts with `GOCSPX-`                      | Blank or wrong project              |
| `OWNER_EMAIL`                   | matches the Google account to be connected | Trillium's email left in by mistake |
| `NEXT_PUBLIC_SITE_URL`          | tenant's actual domain                     | Template URL left in                |

**After setting env vars, verify the build gate passes locally:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourref.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
pnpm prebuild
```

The build gate (`scripts/validate-env.ts`, wired as `prebuild`) will fail loudly if either Supabase var is missing or doesn't match the expected format. It runs automatically before every `pnpm build`.

**After first deploy:**

- [ ] `/api/health` returns `"status": "ok"` (not `degraded`)
- [ ] `/auth/login` loads without JS errors
- [ ] Signing up with the admin email gives admin role
- [ ] `/admin/connect-google` completes without error
- [ ] `/admin` shows calendar data

---

## Known Limitations

- **Single Google account per deployment** — the app is designed for one practitioner per deployment. `OWNER_EMAIL` ties the entire calendar/email integration to one account. Multiple practitioners sharing a deployment is not currently supported.
- **Slug configurations are hardcoded** — booking page rules (pricing, durations, locations) are defined in TypeScript, not the database. Changing them requires a code deploy.
- **No built-in invoicing** — invoice tables exist in the schema but the invoice flow is minimal. Use a separate tool (Wave, HoneyBook, etc.) for formal invoicing.
