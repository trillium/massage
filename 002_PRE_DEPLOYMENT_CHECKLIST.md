# Pre-Deployment Checklist

Everything that needs to happen before the site is live for a new service provider.

---

## 1. Supabase Setup

- [ ] Create a new Supabase project
- [ ] Run all database migrations (11 migration files)
- [ ] Update Supabase project ref in CSP header (`next.config.js:15`)
- [ ] Update admin email in migration `20250101000004_add_admin_email.sql`
- [ ] Update admin email in `setup_admin.sql`
- [ ] Update site URL and redirect URLs in `supabase/config.toml`
- [ ] Remove wildcard `massage-*.vercel.app` redirect or update to new project name

---

## 2. Authentication

- [ ] Set `ADMIN_EMAILS` env var with new owner's email
- [ ] Update Supabase auth email templates — currently branded "Trillium Massage"
- [ ] Update test admin email in `tests/e2e/auth.setup.ts` and `tests/e2e/helpers/auth.ts`
- [ ] Set `TEST_ADMIN_PASSWORD` env var for e2e tests

---

## 3. Google API Setup

- [ ] Create Google Cloud project (or reuse existing)
- [ ] Enable Gmail API, Google Calendar API, Google Maps API
- [ ] Create OAuth credentials
- [ ] Generate refresh token
- [ ] Set env vars: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`
- [ ] Set `GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID`
- [ ] Update calendar IDs in `config.ts:22-23` with new owner's Google Calendar email(s)

---

## 4. Email Configuration

- [ ] Set up Gmail SMTP with OAuth2 for the new owner's email
- [ ] Update from address (currently `hello@flowerflyther.com`)
- [ ] Update email signatures — "Trillium Smith, LMT" hardcoded in:
  - `lib/messaging/utilities/signature.ts`
  - `lib/messaging/email/admin/AdminAccessEmail.ts`
  - `lib/messaging/email/admin/contactFormEmail.ts`
  - `lib/messaging/email/client/contactFormConfirmation.ts`
  - `lib/messaging/templates/events/eventDescription.ts`
- [ ] Update email subject "Admin Access Link - Massage Booking System" in `AdminAccessEmail.ts`
- [ ] Update "massage booking system" security notice text in `AdminAccessEmail.ts`

---

## 5. Domain & URLs

- [ ] Register or configure new domain
- [ ] Set `NEXT_PUBLIC_SITE_URL` env var
- [ ] Replace all hardcoded `trilliummassage.la` fallbacks (9 files — see 000 dev reference)
- [ ] Update PostHog hostname routing in `context/AnalyticsContext.tsx` (checks for 3 subdomains)
- [ ] Update Supabase redirect URLs in `supabase/config.toml`
- [ ] Update `siteUrl` in `data/siteMetadata.js`
- [ ] Configure DNS to point to Vercel

---

## 6. Vercel Deployment

- [ ] Create Vercel project linked to the repo
- [ ] Configure all environment variables (~28 env vars — see `.env.example`)
- [ ] Verify CSP header allows new Supabase project domain
- [ ] Verify preview deployments work

---

## 7. Content Updates

- [ ] Update owner name across all files (11 locations — see 000 dev reference section 1)
- [ ] Update business name across all files (13 locations — see 000 dev reference section 2)
- [ ] Update location, coordinates, service area (6 locations — see 000 dev reference section 8)
- [ ] Update business hours and availability in `config.ts`
- [ ] Update pricing in `config.ts`
- [ ] Update service definitions in `data/servicesData.ts`
- [ ] Update hero copy in `components/landingPage/HeroSection.tsx`
- [ ] Update about section in `components/landingPage/AboutSection.tsx`
- [ ] Update FAQ in `components/FAQ/questions.ts`
- [ ] Update author bio in `data/authors/default.mdx`
- [ ] Update footer in `components/Footer.tsx`
- [ ] Update booking page title in `app/book/page.tsx`
- [ ] Update login page text in `app/auth/supabase-login/page.tsx`
- [ ] Update contact form subject in `lib/handleContactRequest.ts`

---

## 8. Payment Methods

- [ ] Update Venmo handle in `data/paymentMethods.ts` (currently @TrilliumSmith)
- [ ] Update CashApp handle in `data/paymentMethods.ts` (currently $trilliummassage)
- [ ] Add or remove payment methods as needed

No Stripe/Square integration — payment methods are text-only.

---

## 9. Image Assets

- [ ] Replace profile photo / avatar (`/static/images/avatar.jpg`)
- [ ] Replace or update logo (`/static/images/logo.svg`)
- [ ] Replace social media preview image (`/static/images/twitter-card.jpg`)
- [ ] Update favicon
- [ ] Replace gallery photos in `/static/images/gallery/` (20+ massage-specific photos)
- [ ] Replace service area map image if applicable

---

## 10. Blog Posts

- [ ] Remove or rewrite `data/blog/free-30.mdx` (massage promo)
- [ ] Remove or rewrite `data/blog/now-on-airbnb.mdx` (Airbnb listing)
- [ ] Remove or rewrite `data/blog/when-to-book-on-airbnb.mdx` (platform comparison)
- [ ] Remove or rewrite `data/blog/airbnb-50-percent-promo.mdx` (Airbnb promo)

---

## 11. Legacy Integrations

- [ ] Audit Soothe integration (`app/api/admin/gmail/soothe-bookings`) — remove if not needed
- [ ] Remove or update Airbnb service ID in `TestimonialsSection.tsx` (ID: 6527842)
- [ ] Remove or update Airbnb listing URLs in blog posts
- [ ] Clean up review sources that reference Soothe, Airbnb, "Trillium Massage"

---

## 12. Social Media

- [ ] Update Instagram link in `data/siteMetadata.js`
- [ ] Update or remove LinkedIn, Facebook, other social links
- [ ] Update GitHub repo URL in `data/siteMetadata.js`

---

## 13. Analytics

- [ ] Set up PostHog project (or skip if not needed)
- [ ] Set `NEXT_PUBLIC_POSTHOG_KEY_PROD` and `NEXT_PUBLIC_POSTHOG_KEY_DEV` env vars
- [ ] Update hostname checks in `context/AnalyticsContext.tsx` for new domain

---

## 14. SEO

- [ ] Update site title and description in `data/siteMetadata.js`
- [ ] Verify robots.txt and sitemap generate correctly (both are dynamic — should work)
- [ ] No JSON-LD structured data to update (none exists)

---

## 15. Testing

- [ ] Update hardcoded test email `trilliummassagela@gmail.com` in e2e tests
- [ ] Update mock data emails in admin flow components
- [ ] Run full test suite to verify nothing breaks
- [ ] Test booking flow end-to-end
- [ ] Test contact form submission
- [ ] Test admin login and dashboard

---

## 16. README

- [ ] Update contact info in `README.md`
- [ ] Update project URLs and social links
- [ ] Update any references to old business name or domain

---

## Optional Features

These are in the codebase but may not be needed:

- [ ] Pushover notifications — configure if desired
- [ ] Appointment reminders — new feature, needs cron/scheduler setup
- [ ] SMS notifications — infrastructure exists but needs configuration
