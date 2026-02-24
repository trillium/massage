# Personalization Guide

Everything that needs to change when setting up this site for a new business owner.

---

## 1. Owner Identity

| What | Where | Current Value |
|------|-------|---------------|
| Owner name | `data/siteMetadata.js:4` | Kendra Anderson |
| Owner name | `data/authors/default.mdx:2` | Kendra Anderson |
| Owner name | `components/landingPage/AboutSection.tsx:15,23-34` | Kendra Anderson (alt text + bio) |
| Owner name | `app/book/page.tsx:38` | "Book a reading with Kendra :)" |
| Person name (email sig) | `lib/messaging/utilities/signature.ts:6` | Trillium Smith |
| Person name (emails) | `lib/messaging/email/admin/AdminAccessEmail.ts:20` | Trillium Smith |
| Person name (emails) | `lib/messaging/email/admin/contactFormEmail.ts:21` | Trillium Smith, LMT |
| Person name (emails) | `lib/messaging/email/client/contactFormConfirmation.ts:18` | Trillium Smith, LMT |
| Person name (events) | `lib/messaging/templates/events/eventDescription.ts:93` | Trillium Smith, LMT |
| Person name (mocks) | `app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx:65,243,247` | Trillium Smith, LMT |
| Person name (README) | `README.md:213` | Trillium Smith |

---

## 2. Business Name

| What | Where | Current Value |
|------|-------|---------------|
| Business name | `data/siteMetadata.js:18` | Flower Flyther |
| Business name | `data/authors/default.mdx:5` | Flower Flyther |
| Business name | `components/landingPage/ContactSection.tsx:19` | Flower Flyther |
| Business name | `components/landingPage/AboutSection.tsx:23` | About Flower Flyther |
| Business name | `components/ReviewForm.tsx:64` | Flower Flyther |
| Business name | `lib/handleContactRequest.ts:72` | "Thank you for contacting Flower Flyther" |
| Business name | `app/auth/supabase-login/page.tsx:31` | "New to Flower Flyther?" |
| Email sig business name | `lib/messaging/utilities/signature.ts:8` | Trillium Massage |
| Email sig business name | `lib/messaging/email/admin/AdminAccessEmail.ts:21` | Trillium Massage |
| Email subject | `lib/messaging/email/admin/AdminAccessEmail.ts:33` | "Admin Access Link - Massage Booking System" |
| Email content | `lib/messaging/email/admin/AdminAccessEmail.ts:54` | "massage booking system" |
| Footer service headers | `components/Footer.tsx:80,86` | In-Home / In-Office Massage Services |
| Footer service blurb | `components/Footer.tsx:157` | "Providing professional massage therapy services..." |

---

## 3. Email Addresses

| What | Where | Current Value |
|------|-------|---------------|
| Business email | `data/siteMetadata.js:16` | hello@flowerflyther.com |
| Author email | `data/authors/default.mdx:6` | hello@flowerflyther.com |
| Google Calendar IDs | `config.ts:22-23` | trillium@hatsfabulous.com, trillium@trilliumsmith.com |
| Admin email (DB migration) | `supabase/migrations/20250101000004_add_admin_email.sql:3` | trilliummassagela@gmail.com |
| Admin email (setup script) | `setup_admin.sql` (multiple) | trilliummassagela@gmail.com |
| Test admin email | `tests/e2e/auth.setup.ts:7` | trilliummassagela@gmail.com |
| Test admin email | `tests/e2e/helpers/auth.ts:14` | trilliummassagela@gmail.com |
| Mock emails | `app/admin/mocked_user_flow/components/Step5EventObjectDetails.tsx` | trillium@trilliummassage.la |
| Mock emails | `app/admin/mocked_user_flow/components/step5/MockCalendarEventJson.tsx:37,41` | trillium@trilliummassage.la |
| Env template | `.env.example:48-50` | OWNER_EMAIL, OWNER_NAME, OWNER_PHONE_NUMBER |

---

## 4. Phone Numbers & Payment Handles

| What | Where | Current Value |
|------|-------|---------------|
| Venmo handle + phone hint | `data/paymentMethods.ts:10` | @TrilliumSmith, last 4: 5344 |
| CashApp handle | `data/paymentMethods.ts:15` | $trilliummassage |
| Owner phone (env-driven) | `lib/messaging/utilities/signature.ts:7` | from OWNER_PHONE env var |

---

## 5. Domain Names & URLs

| What | Where | Current Value |
|------|-------|---------------|
| Site URL | `data/siteMetadata.js:9` | https://flowerflyther.com/ |
| Email sig URL | `lib/messaging/utilities/signature.ts:9-11` | https://trilliummassage.la/ |
| Email footer URLs | `lib/messaging/email/client/contactFormConfirmation.ts:19` | https://trilliummassage.la/ |
| Email footer URLs | `lib/messaging/email/admin/AdminAccessEmail.ts:22` | https://trilliummassage.la/ |
| Email footer URLs | `lib/messaging/email/admin/contactFormEmail.ts:23` | https://trilliummassage.la/ |
| Event description links | `lib/messaging/templates/events/eventDescription.ts:84,95` | https://trilliummassage.la |
| Analytics hostname check | `context/AnalyticsContext.tsx:10-13` | trilliummassage.la (3 variants) |
| Client email fallback | `lib/messaging/email/client/ClientConfirmEmail.ts:25` | https://trilliummassage.la |
| Client email fallback | `lib/messaging/email/client/ClientRequestEmail.ts:25` | https://trilliummassage.la |
| BookedCard fallback | `components/BookedCard.tsx:54` | trilliummassage.la |
| Env validation fallback | `lib/env.ts:81` | https://trilliummassage.la |
| Supabase auth config | `supabase/config.toml:154,156` | trilliummassage.la redirect URLs |
| GitHub repo | `data/siteMetadata.js:10` | https://github.com/Spiteless/flower-flyther/ |
| Env template | `.env.example:53` | NEXT_PUBLIC_SITE_URL |

---

## 6. Social Media

| What | Where | Current Value |
|------|-------|---------------|
| Instagram | `data/siteMetadata.js:28` | https://www.instagram.com/flowerflyther |
| LinkedIn | `data/siteMetadata.js:26` | https://www.linkedin.com/in/trilliumsmith/ (commented out) |
| LinkedIn | `README.md:246` | https://www.linkedin.com/in/trilliumsmith/ |

---

## 7. Airbnb & Booking Platforms

| What | Where | Current Value |
|------|-------|---------------|
| Airbnb listing URL | `data/blog/now-on-airbnb.mdx:13` | https://airbnb.com/sv/trilliummassage |
| Airbnb listing URL | `data/blog/airbnb-50-percent-promo.mdx:36,51` | https://airbnb.com/sv/trilliummassage |
| Airbnb listing URL | `data/blog/when-to-book-on-airbnb.mdx:47` | https://airbnb.com/sv/trilliummassage |
| Airbnb reviews (service ID) | `components/landingPage/TestimonialsSection.tsx:12` | Service ID 6527842 |

---

## 8. Location & Service Area

| What | Where | Current Value |
|------|-------|---------------|
| Location | `data/siteMetadata.js:19` | Los Angeles, CA |
| Timezone | `config.ts:26` | America/Los_Angeles |
| Map coordinates | `components/landingPage/ContactSection.tsx:22-24` | 33.99, -118.4 (LA) |
| Service area text | `components/landingPage/ContactSection.tsx:32` | "Serving the LA Metro Area" |
| FAQ service area | `components/FAQ/questions.ts:143` | "greater Los Angeles Area, based out of Westchester by LAX" |
| Footer location | `components/Footer.tsx:202-203` | Westchester Area by LAX, Los Angeles |

---

## 9. Business Hours & Availability

| What | Where | Current Value |
|------|-------|---------------|
| Work hours | `config.ts:30-39` | 10 AM - 11 PM, 7 days |
| Weekly availability | `config.ts:41-49` | All 7 days enabled |
| Footer hours text | `components/Footer.tsx:223,227` | "Open 7 Days a Week" / "By Appointment Daily" |

---

## 10. Pricing

| What | Where | Current Value |
|------|-------|---------------|
| Default price | `config.ts:5` | $140 |
| Full pricing matrix | `config.ts:6-17` | 15-240 min duration tiers |

---

## 11. Services & Content

| What | Where | Current Value |
|------|-------|---------------|
| Service definitions | `data/servicesData.ts:5-60` | 5 tarot reading services |
| Hero copy / taglines | `components/landingPage/HeroSection.tsx:32-40` | "Free Thinking Tarot" etc. |
| About bio | `components/landingPage/AboutSection.tsx:26-34` | Kendra's tarot reader bio |
| Author bio | `data/authors/default.mdx:9-11` | Professional biography |
| FAQ content | `components/FAQ/questions.ts` | ~15 Q&A items |

---

## 12. Blog Posts (need full rewrites)

| File | Topic |
|------|-------|
| `data/blog/free-30.mdx` | Free 30-min massage promo |
| `data/blog/now-on-airbnb.mdx` | Airbnb listing announcement |
| `data/blog/when-to-book-on-airbnb.mdx` | Booking platform comparison |
| `data/blog/airbnb-50-percent-promo.mdx` | 50% off Airbnb promo |

---

## 13. Credentials & Qualifications

| What | Where | Current Value |
|------|-------|---------------|
| "LMT" designation | Multiple email templates | Trillium Smith, LMT |
| Experience claims | `data/blog/free-30.mdx:37,91` | "10 years", "925 massages", "4.9 stars" |
| Session count | `data/blog/now-on-airbnb.mdx:17` | "2500+ sessions on Soothe" |

---

## 14. Analytics & Service Config

| What | Where | Current Value |
|------|-------|---------------|
| PostHog keys | `.env` (not checked in) | NEXT_PUBLIC_POSTHOG_KEY_PROD/DEV |
| PostHog proxy | `next.config.js:118-129` | Rewrites to /hostpog |
| PostHog hostname routing | `context/AnalyticsContext.tsx:10-13` | Hardcoded trilliummassage.la checks |

---

## 15. Legal & Copyright

| What | Where | Current Value |
|------|-------|---------------|
| Footer copyright | `components/Footer.tsx:120-126` | Dynamic from siteMetadata |
| License | `README.md:205` | MIT License |

---

## Notes

- **Environment variables** handle most sensitive config well (API keys, owner contact). Fill in `.env` per the `.env.example` template.
- **Hardcoded fallbacks** in email templates are a risk — if env vars aren't set, old domains/names leak through.
- **Google Calendar IDs** are hardcoded in `config.ts` — should be moved to env vars.
- **PostHog hostname checks** in `AnalyticsContext.tsx` are hardcoded — need updating per domain.
- **Airbnb service ID** (6527842) is specific to the current listing.
