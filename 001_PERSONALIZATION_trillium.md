# Dev Tasks — Trillium's Side

Things to wire up once Mom fills in her info. She doesn't need to worry about any of this.

---

## Environment & Infrastructure

- [ ] Set up `.env` with her OWNER_EMAIL, OWNER_NAME, OWNER_PHONE_NUMBER
- [ ] Set up NEXT_PUBLIC_SITE_URL for her domain
- [ ] Configure PostHog keys (NEXT_PUBLIC_POSTHOG_KEY_PROD / DEV)
- [ ] Update PostHog hostname routing in `context/AnalyticsContext.tsx:10-13`
- [ ] Set up her Google Calendar and update calendar IDs in `config.ts:22-23`
- [ ] Update Supabase auth redirect URLs in `supabase/config.toml:154,156`
- [ ] Run admin email migration / update `setup_admin.sql` with her email
- [ ] Update admin email in `supabase/migrations/20250101000004_add_admin_email.sql`

## Domain & URLs

- [ ] Replace all hardcoded `trilliummassage.la` fallbacks:
  - `lib/messaging/utilities/signature.ts:9-11`
  - `lib/messaging/email/client/contactFormConfirmation.ts:19`
  - `lib/messaging/email/admin/AdminAccessEmail.ts:22`
  - `lib/messaging/email/admin/contactFormEmail.ts:23`
  - `lib/messaging/templates/events/eventDescription.ts:84,95`
  - `lib/messaging/email/client/ClientConfirmEmail.ts:25`
  - `lib/messaging/email/client/ClientRequestEmail.ts:25`
  - `components/BookedCard.tsx:54`
  - `lib/env.ts:81`
- [ ] Update GitHub repo URL in `data/siteMetadata.js:10`

## Code Changes (using her info)

- [ ] Swap owner/person names across all email templates and signatures (11 locations — see 000 doc section 1)
- [ ] Swap business name across site + emails (13 locations — see 000 doc section 2)
- [ ] Update email addresses in mock data and test files
- [ ] Update payment handles in `data/paymentMethods.ts`
- [ ] Update social media links in `data/siteMetadata.js`
- [ ] Update location, coordinates, service area text (6 locations — see 000 doc section 8)
- [ ] Update business hours and availability in `config.ts`
- [ ] Update pricing in `config.ts`
- [ ] Rewrite service definitions in `data/servicesData.ts`
- [ ] Rewrite hero copy in `components/landingPage/HeroSection.tsx`
- [ ] Rewrite about section in `components/landingPage/AboutSection.tsx`
- [ ] Rewrite FAQ in `components/FAQ/questions.ts`
- [ ] Rewrite author bio in `data/authors/default.mdx`
- [ ] Update booking page title in `app/book/page.tsx:38`
- [ ] Update footer service descriptions in `components/Footer.tsx`
- [ ] Update login page text in `app/auth/supabase-login/page.tsx:31`
- [ ] Update contact form subject in `lib/handleContactRequest.ts:72`
- [ ] Remove or update "LMT" credential references

## Blog Posts (full rewrites or removal)

- [ ] `data/blog/free-30.mdx` — massage promo, not relevant
- [ ] `data/blog/now-on-airbnb.mdx` — Airbnb massage listing
- [ ] `data/blog/when-to-book-on-airbnb.mdx` — platform comparison
- [ ] `data/blog/airbnb-50-percent-promo.mdx` — Airbnb promo

## Branding & Assets

- [ ] Replace profile photo / headshot
- [ ] Replace or update logo
- [ ] Update brand colors if needed
- [ ] Update favicon
- [ ] Update social media preview image (`twitter-card.jpg`)

## Airbnb Integration (if applicable)

- [ ] Update or remove Airbnb service ID in `TestimonialsSection.tsx:12`
- [ ] Update or remove Airbnb listing URLs in blog posts

## README

- [ ] Update contact info in `README.md:213`
- [ ] Update project URLs and social links
