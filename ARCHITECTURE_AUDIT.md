# Architecture Audit: Trillium Massage Booking Platform

**Audit Date:** 2026-02-09
**Codebase:** `trillium-massage` v0.2.0
**Branch:** `polecat/furiosa/app-4gp@mlffj5rw`

---

## Executive Summary

This is a full-stack massage booking platform built on Next.js 16 (React 19) with the
App Router pattern. It combines a public-facing booking system, a blog/content site, and
an admin dashboard into a single deployment. The app integrates with Google Calendar for
availability, Gmail for third-party booking extraction, Supabase for auth/database, and
PostHog for analytics.

**Key finding:** The system runs three parallel authentication mechanisms (Supabase,
HMAC-token admin auth, HMAC-token user auth). This is the most architecturally significant
pattern in the codebase and warrants attention for long-term maintainability.

---

## 1. High-Level Architecture

```
+------------------------------------------------------------------+
|                        BROWSER (Client)                          |
|                                                                  |
|  +------------------+  +---------------+  +-------------------+  |
|  | React Components |  | Redux Store   |  | PostHog Analytics |  |
|  | (App Router)     |  | (7 slices)    |  | (via proxy)       |  |
|  +--------+---------+  +-------+-------+  +---------+---------+  |
|           |                    |                    |             |
|           |   localStorage     |                    |             |
|           |   +-----------+    |                    |             |
|           |   | admin_    |    |                    |             |
|           |   | session   |    |                    |             |
|           |   | user_     |    |                    |             |
|           |   | session   |    |                    |             |
|           |   +-----------+    |                    |             |
+-----------+--------------------+--------------------+------------+
            |                    |                    |
            v                    v                    v
+------------------------------------------------------------------+
|                     NEXT.JS SERVER (Vercel)                       |
|                                                                  |
|  +------------+  +--------------+  +---------------------------+ |
|  | Middleware  |  | API Routes   |  | Server Components (SSR)  | |
|  | (proxy.ts) |  | /api/*       |  | app/*/page.tsx            | |
|  +-----+------+  +------+-------+  +-------------+------------+ |
|        |                |                        |               |
|        v                v                        v               |
|  +-----------------------------------------------------------+  |
|  |                   LIB LAYER                                |  |
|  |                                                            |  |
|  |  +-------------+  +-----------+  +-----------+             |  |
|  |  | adminAuth   |  | supabase/ |  | availa-   |             |  |
|  |  | userAuth    |  | client.ts |  | bility/   |             |  |
|  |  | adminFetch  |  | server.ts |  | engine    |             |  |
|  |  +-------------+  +-----------+  +-----------+             |  |
|  |                                                            |  |
|  |  +-------------+  +-----------+  +-----------+             |  |
|  |  | messaging/  |  | gmail/    |  | fetch/    |             |  |
|  |  | email+push  |  | extract   |  | calendar  |             |  |
|  |  +-------------+  +-----------+  +-----------+             |  |
|  +-----------------------------------------------------------+  |
+------------------------------------------------------------------+
            |           |           |            |
            v           v           v            v
+----------+ +--------+ +--------+ +----------+ +---------+
| Supabase | | Google | | Gmail  | | Pushover | | PostHog |
| (Auth+DB)| | Cal API| | API    | | (Push)   | | (Analy) |
+----------+ +--------+ +--------+ +----------+ +---------+
```

---

## 2. Technology Stack

| Layer              | Technology                      | Version   |
|--------------------|---------------------------------|-----------|
| Framework          | Next.js (App Router)            | 16.0.7    |
| UI Library         | React                           | 19.2.0    |
| Language           | TypeScript                      | 5.9       |
| Styling            | Tailwind CSS                    | 4.0.5     |
| State Management   | Redux Toolkit                   | 2.5.0     |
| Database + Auth    | Supabase (PostgreSQL)           | 2.80      |
| Forms              | Formik + Zod                    | 2.4 / 4.0 |
| Maps               | MapLibre GL                     | 5.6.2     |
| Content/Blog       | Contentlayer2 (MDX)             | 0.5.5     |
| Email              | Nodemailer (Gmail SMTP/OAuth2)  | 6.9       |
| Analytics          | PostHog (self-hosted proxy)     | 1.258     |
| Push Notifications | Pushover                        | --        |
| Testing            | Vitest + Playwright             | 3.2 / 1.56|
| Package Manager    | pnpm                            | 9.15.0    |

---

## 3. Directory Structure

```
/
├── app/                        # Next.js App Router pages & API routes
│   ├── layout.tsx              # Root layout (theme, analytics, header/footer)
│   ├── page.tsx                # Home page
│   ├── theme-providers.tsx     # Provider composition root
│   ├── StoreProvider.tsx       # Redux store provider
│   ├── [bookingSlug]/          # Dynamic promo/booking routes
│   ├── admin/                  # Admin dashboard (protected)
│   │   ├── layout.tsx          # Admin layout with auth wrapper
│   │   ├── gmail-events/       # Soothe email extraction
│   │   ├── mocked_user_flow/   # E2E booking flow tester
│   │   └── ...                 # 12 admin sub-pages
│   ├── api/                    # 28 API routes (see Section 6)
│   │   ├── admin/              # Admin-only endpoints
│   │   ├── auth/supabase/      # Supabase auth endpoints
│   │   ├── events/             # Calendar event CRUD
│   │   ├── request/            # Booking request handler
│   │   ├── onsite/             # On-site booking handler
│   │   └── ...
│   ├── auth/                   # Login/auth pages
│   ├── blog/                   # Blog listing + [slug] pages
│   ├── book/                   # Main booking page
│   ├── event/[event_id]/       # Event detail + adjacent/next
│   ├── my_events/              # User event dashboard (protected)
│   └── reviews/                # Reviews listing + submission
│
├── components/                 # ~100 React components
│   ├── auth/                   # Auth components (admin + supabase)
│   ├── availability/           # Calendar, time picker, duration
│   ├── booking/                # Booking form, fields, features
│   ├── hero/                   # Hero sections
│   ├── landingPage/            # Landing page sections
│   ├── skeletons/              # Loading states
│   └── ui/                     # Atomic UI components
│
├── lib/                        # Core business logic (~100 files)
│   ├── availability/           # Slot calculation engine (15 files)
│   ├── messaging/              # Email templates + push (15 files)
│   ├── fetch/                  # Calendar data fetching (4 files)
│   ├── gmail/                  # Gmail API integration (2 files)
│   ├── supabase/               # Supabase client/server (5 files)
│   ├── helpers/                # Location, booking, event helpers
│   ├── slugConfigurations/     # Per-slug booking config
│   └── *Types.ts               # 13 type definition files
│
├── redux/                      # Redux Toolkit state
│   ├── store.ts                # Store configuration
│   ├── hooks.ts                # Typed hooks
│   └── slices/                 # 7 state slices
│
├── data/                       # Static content & config
│   ├── blog/                   # MDX blog posts (4)
│   ├── ratings-*.ts            # Platform-specific reviews
│   ├── siteMetadata.js         # Site-wide metadata
│   └── servicesData.ts         # Service offerings
│
├── layouts/                    # Blog/content layouts (6 files)
├── context/                    # React Context (PostHog analytics)
├── features/                   # Feature components (1 file)
├── scripts/                    # Build/utility scripts (16 files)
├── supabase/                   # DB migrations (6 SQL files)
├── css/                        # Tailwind + Prism styles
├── src/lib/mcp/                # MCP server tools
├── config.ts                   # Business config (pricing, hours)
├── proxy.ts                    # Middleware (auth + route protection)
└── mcp-server.ts               # MCP server entry point
```

---

## 4. Authentication Architecture (3 Parallel Systems)

This is the most complex part of the architecture. Three auth systems coexist:

```
                    ┌─────────────────────────────┐
                    │    AUTHENTICATION LAYER      │
                    └──────────┬──────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
          v                    v                     v
  ┌───────────────┐   ┌───────────────┐   ┌────────────────┐
  │  SUPABASE     │   │ ADMIN AUTH    │   │ USER AUTH      │
  │  (Primary)    │   │ (HMAC Token)  │   │ (HMAC Token)   │
  │               │   │               │   │                │
  │ OAuth/Magic   │   │ Email-based   │   │ Email-based    │
  │ Link/Password │   │ signed links  │   │ signed links   │
  │               │   │               │   │                │
  │ Cookie-based  │   │ localStorage  │   │ localStorage   │
  │ sessions      │   │ + headers     │   │ + headers      │
  │               │   │               │   │                │
  │ Server-side   │   │ HMAC-SHA256   │   │ HMAC-SHA256    │
  │ validation    │   │ token signing │   │ token signing  │
  │               │   │               │   │                │
  │ Profiles DB   │   │ x-admin-email │   │ URL params     │
  │ with roles    │   │ x-admin-token │   │ email + token  │
  └───────────────┘   └───────────────┘   └────────────────┘
        │                    │                     │
        │ Used by:           │ Used by:            │ Used by:
        │ • Middleware        │ • Admin dashboard   │ • /my_events
        │ • /auth/* pages    │ • Admin API routes  │ • Event viewing
        │ • /admin (role)    │ • Admin nav/UI      │
        │ • Profile mgmt    │ • Gmail extraction   │
        └────────────────────┴─────────────────────┘
```

### 4a. Supabase Auth (Primary System)

- **Transport:** HTTP-only cookies managed by middleware
- **Validation:** `proxy.ts` calls `supabase.auth.getUser()` on every request
- **Admin check:** Queries `profiles` table for `role === 'admin'`
- **Protected routes:** `/admin` (requires admin role), `/my_events` (requires auth)
- **Files:** `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/auth-helpers.ts`
- **Login methods:** Magic link (OTP), Google OAuth, password

### 4b. AdminAuthManager (Legacy HMAC System)

- **Transport:** `x-admin-email` + `x-admin-token` headers (via `adminFetch()`)
- **Session storage:** `localStorage` key `admin_session`
- **Token format:** `Base64(email:expiresTimestamp|HMAC-SHA256-signature)`
- **Token lifetime:** 15 days; session: 30 days
- **Secret:** `GOOGLE_OAUTH_SECRET` environment variable
- **Flow:**
  1. Admin requests access at `/api/admin/request-access`
  2. Server checks email against `ADMIN_EMAILS` env var
  3. Generates signed link → sent via email
  4. Client validates at `/api/admin/validate` → creates localStorage session
  5. All admin API calls use `adminFetch()` which injects auth headers
- **Files:** `lib/adminAuth.ts`, `lib/adminFetch.ts`

### 4c. UserAuthServerManager (User HMAC System)

- **Purpose:** Allows clients to view their booked events without full login
- **Token format:** Same as admin (HMAC-signed, 15-day expiry)
- **Flow:** User receives email with signed `/my_events?email=...&token=...` link
- **Validation:** `POST /api/user/validate`
- **Files:** `lib/userAuth.ts` (client), `lib/userAuthServer.ts` (server)

---

## 5. State Management (Redux Toolkit)

```
┌──────────────────────────────────────────────────────────────┐
│                     REDUX STORE                              │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ formSlice   │  │ availability │  │ configSlice       │  │
│  │             │  │ Slice        │  │                   │  │
│  │ firstName   │  │ start/end    │  │ bookingSlug       │  │
│  │ lastName    │  │ selectedDate │  │ pricing {}        │  │
│  │ email       │  │ selectedTime │  │ allowedDurations  │  │
│  │ phone       │  │ duration     │  │ location          │  │
│  │ location    │  │ timeZone     │  │ instantConfirm    │  │
│  │ paymentMeth │  │ slots []     │  │ discount          │  │
│  │ promo       │  │ driveTime    │  │ blockingScope     │  │
│  │ hotelRoom   │  │ adjBuffer    │  │ customFields      │  │
│  │ parking     │  │              │  │ eventContainer    │  │
│  │ notes       │  │              │  │ leadTimeMinimum   │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ authSlice   │  │ modalSlice   │  │ eventContainers   │  │
│  │             │  │              │  │ Slice             │  │
│  │ isAuth      │  │ status:      │  │ location          │  │
│  │ adminEmail  │  │ open|busy|   │  │ eventBaseString   │  │
│  │             │  │ error|closed │  │ eventMemberString │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                              │
│  ┌─────────────┐                                            │
│  │ readySlice  │  Custom Hooks: useReduxAvailability()      │
│  │             │                useReduxFormData()           │
│  │ Calendar    │                useReduxConfig()             │
│  │ TimeList    │                useReduxModal()              │
│  │ hidden      │                useReduxEventContainers()    │
│  └─────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. API Route Inventory (28 Routes)

### Booking Flow

```
POST /api/request              Rate-limited (5/min). Main booking submission.
                               Validates with Zod, creates calendar event or
                               sends approval email. Sends push + email.

GET  /api/confirm              Hash-verified appointment confirmation.
                               Creates Google Calendar event on approval.

POST /api/onsite/request       Rate-limited (5/min). On-site booking request.
GET  /api/onsite/confirm       On-site appointment confirmation.

POST /api/contact              Rate-limited (3/min). Contact form handler.
POST /api/newsletter           Newsletter subscription (via Pliny).
POST /api/driveTime            Google Maps distance/time calculation.
POST /api/review/create        User review submission.
GET  /api/loc                  Location lookup.
GET  /api/tiles/[z]/[x]/[y]   Map tile proxy server.
```

### Admin Routes (HMAC-protected via headers)

```
POST /api/admin/request-access Rate-limited (2/min). Sends admin link email.
POST /api/admin/validate       Server-side admin token validation.
POST /api/admin/create-appointment  Direct calendar event creation.
GET  /api/admin/configuration/[slug]  Booking slug configuration.
GET  /api/admin/gmail/soothe-bookings  Gmail Soothe booking extraction.
```

### Auth Routes (Supabase)

```
GET  /api/auth/supabase/profile       Get current user profile.
PUT  /api/auth/supabase/profile       Update user profile.
GET  /api/auth/supabase/admin/users   List all users (admin-only).
POST /api/auth/supabase/admin/promote Promote user to admin.
POST /api/auth/supabase/admin/demote  Demote admin to user.
GET  /api/auth/callback/supabase      OAuth callback handler.
```

### User Routes

```
POST /api/user/validate               User HMAC token validation.
GET  /api/events/byEmail              Events by email (18mo past, 6mo future).
GET  /api/events/[event_id]           Single calendar event detail.
POST /api/events/update               Update calendar event.
```

### Dev-Only

```
POST /api/dev-mode-prod-excluded/capture-test-data  (stripped in prod build)
```

---

## 7. Booking Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────────┐
│  Client   │     │  Redux   │     │ BookingForm.tsx   │
│  Browser  │────>│  Store   │────>│ + field components│
└──────────┘     └──────────┘     └────────┬─────────┘
                                           │
                                    User clicks Submit
                                           │
                                           v
                               ┌───────────────────────┐
                               │ POST /api/request      │
                               │                        │
                               │ 1. Rate limit check    │
                               │ 2. Zod validation      │
                               │ 3. HTML escape all     │
                               │    user input          │
                               │ 4. PostHog identify    │
                               └───────────┬───────────┘
                                           │
                          ┌────────────────┴────────────────┐
                          │                                  │
                   instantConfirm?                    Standard Flow
                          │                                  │
                          v                                  v
              ┌──────────────────┐              ┌──────────────────────┐
              │ 1. Create Google │              │ 1. Generate approval │
              │    Calendar event│              │    URL with hash     │
              │                  │              │                      │
              │ 2. Pushover push │              │ 2. Send approval     │
              │    (instant)     │              │    email to admin    │
              │                  │              │                      │
              │ 3. Confirmation  │              │ 3. Pushover push     │
              │    email to      │              │    to admin          │
              │    client        │              │                      │
              └──────────────────┘              │ 4. Request confirm   │
                                                │    email to client   │
                                                └──────────┬───────────┘
                                                           │
                                                  Admin clicks approve
                                                           │
                                                           v
                                                ┌──────────────────────┐
                                                │ GET /api/confirm     │
                                                │                      │
                                                │ 1. Verify hash       │
                                                │ 2. Create calendar   │
                                                │    event             │
                                                │ 3. Send confirmed    │
                                                │    email to client   │
                                                └──────────────────────┘
```

---

## 8. Availability Calculation Engine

```
┌────────────────────────────────────────────────────────────────┐
│                 AVAILABILITY ENGINE                             │
│                 lib/availability/                               │
│                                                                │
│   INPUTS:                                                      │
│   ┌───────────────────┐  ┌────────────────────┐               │
│   │ OWNER_AVAILABILITY│  │ Google Calendar     │               │
│   │ config.ts         │  │ freeBusy API        │               │
│   │                   │  │                     │               │
│   │ Mon-Sun: 10am-11pm│  │ Busy intervals from │               │
│   │ (7 days/week)     │  │ 3 calendars         │               │
│   └────────┬──────────┘  └──────────┬─────────┘               │
│            │                        │                          │
│            v                        v                          │
│   ┌────────────────┐      ┌────────────────┐                  │
│   │ getPotential   │      │ getBusyTimes() │                  │
│   │ Times()        │      │                │                  │
│   │                │      │ Merges busy    │                  │
│   │ Generates      │      │ from primary + │                  │
│   │ 30-min slots   │      │ 2 secondary    │                  │
│   │ within owner   │      │ calendars      │                  │
│   │ hours          │      │                │                  │
│   └────────┬───────┘      └────────┬───────┘                  │
│            │                       │                           │
│            └───────────┬───────────┘                           │
│                        │                                       │
│                        v                                       │
│            ┌───────────────────────┐                           │
│            │ getAvailability()     │                           │
│            │                       │                           │
│            │ For each potential:   │                           │
│            │  - Skip if in past    │                           │
│            │  - Skip if within     │                           │
│            │    LEAD_TIME (3hr)    │                           │
│            │  - Skip if overlaps   │                           │
│            │    any busy interval  │                           │
│            │  - Keep if free       │                           │
│            └───────────┬───────────┘                           │
│                        │                                       │
│                        v                                       │
│            ┌───────────────────────┐                           │
│            │ Available Slots []    │                           │
│            │ → Redux avail slice   │                           │
│            │ → Calendar + TimeList │                           │
│            └───────────────────────┘                           │
│                                                                │
│   SPECIAL MODES:                                               │
│   ┌──────────────────────────────────────────────────┐        │
│   │ Event Container Blocking                          │        │
│   │                                                   │        │
│   │ blockingScope='event'   → only block within       │        │
│   │                           same event container    │        │
│   │ blockingScope='general' → block across ALL        │        │
│   │                           calendar events         │        │
│   │                                                   │        │
│   │ Events tagged: {slug}__EVENT__MEMBER__            │        │
│   │                {slug}__EVENT__CONTAINER__          │        │
│   └──────────────────────────────────────────────────┘        │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. External Service Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│                                                                  │
│  ┌─────────────────────────┐    ┌────────────────────────────┐  │
│  │ GOOGLE CALENDAR API     │    │ GMAIL API                  │  │
│  │                         │    │                            │  │
│  │ OAuth2 (refresh token)  │    │ OAuth2 (refresh token)     │  │
│  │                         │    │                            │  │
│  │ • freeBusy → busy times │    │ • messages.list (search)   │  │
│  │ • events.list (search)  │    │ • messages.get (content)   │  │
│  │ • events.get (single)   │    │                            │  │
│  │ • events.insert (book)  │    │ Used for: Soothe booking   │  │
│  │                         │    │ extraction via regex        │  │
│  │ Calendars checked:      │    │                            │  │
│  │  - primary              │    │ Rate-limited: 10 concurrent│  │
│  │  - trillium@hats...     │    │                            │  │
│  │  - trillium@trillium... │    │                            │  │
│  └─────────────────────────┘    └────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────┐    ┌────────────────────────────┐  │
│  │ SUPABASE                │    │ POSTHOG                    │  │
│  │                         │    │                            │  │
│  │ • Auth (OAuth/Magic     │    │ Self-hosted via proxy:     │  │
│  │   Link/Password)        │    │  /hostpog/* → us.posthog   │  │
│  │ • PostgreSQL (profiles  │    │                            │  │
│  │   table, role-based)    │    │ Events tracked:            │  │
│  │ • RLS policies          │    │  - booking_form_submitted  │  │
│  │                         │    │  - contact_form_submitted  │  │
│  │ Admin client (service   │    │  - admin_login             │  │
│  │ role key) for elevated  │    │  - profile_access          │  │
│  │ operations              │    │                            │  │
│  └─────────────────────────┘    └────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────┐    ┌────────────────────────────┐  │
│  │ NODEMAILER (Gmail SMTP) │    │ PUSHOVER                   │  │
│  │                         │    │                            │  │
│  │ Host: smtp.gmail.com    │    │ Push notifications to      │  │
│  │ Port: 465 (TLS)         │    │ admin device:              │  │
│  │ Auth: OAuth2 refresh    │    │                            │  │
│  │                         │    │ • New appointment request  │  │
│  │ Templates:              │    │ • Instant confirm booking  │  │
│  │  Admin: Approval,       │    │ • Contact form submission  │  │
│  │   AccessEmail, OnSite,  │    │                            │  │
│  │   ReviewSubmission,     │    │                            │  │
│  │   ContactForm           │    │                            │  │
│  │  Client: RequestConfirm,│    │                            │  │
│  │   BookingConfirm,       │    │                            │  │
│  │   ContactConfirm        │    │                            │  │
│  └─────────────────────────┘    └────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────┐    ┌────────────────────────────┐  │
│  │ GOOGLE MAPS API         │    │ MAPLIBRE GL                │  │
│  │                         │    │                            │  │
│  │ Drive time calculation  │    │ Client-side map rendering  │  │
│  │ between therapist and   │    │ for service area display   │  │
│  │ client locations        │    │ and location selection     │  │
│  └─────────────────────────┘    └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Messaging System Architecture

```
                    ┌───────────────────┐
                    │ TRIGGER EVENT      │
                    │ (booking, contact, │
                    │  review, admin)    │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              v               v               v
     ┌────────────┐  ┌──────────────┐  ┌───────────┐
     │ EMAIL      │  │ PUSH         │  │ ANALYTICS │
     │ (Nodemailer│  │ (Pushover)   │  │ (PostHog) │
     │  via SMTP) │  │              │  │           │
     └──────┬─────┘  └──────┬───────┘  └─────┬─────┘
            │               │               │
     ┌──────┴──────┐        │               │
     │             │        │               │
     v             v        v               v
  ┌──────┐    ┌──────┐  ┌──────┐     ┌──────────┐
  │ADMIN │    │CLIENT│  │ADMIN │     │ identify │
  │INBOX │    │INBOX │  │PHONE │     │ User()   │
  └──────┘    └──────┘  └──────┘     └──────────┘

  Templates:                Push types:
  lib/messaging/            lib/messaging/push/
  email/admin/              admin/
  ├── Approval.ts           ├── AppointmentPushover.ts
  ├── AdminAccessEmail.ts   ├── AppointmentPushoverInstantConfirm.ts
  ├── OnSiteRequestEmail.ts └── ContactPushover.ts
  ├── ReviewSubmission.ts
  └── contactFormEmail.ts

  email/client/
  ├── ClientRequestEmail.ts
  ├── ClientConfirmEmail.ts
  └── contactFormConfirmation.ts
```

---

## 11. Provider Composition (Client-Side)

```
app/layout.tsx
  └── <ThemeProviders>                    # app/theme-providers.tsx
        ├── <CSPostHogProvider>           # context/AnalyticsContext.tsx
        │     └── PostHogProvider         # PostHog analytics
        ├── <AuthStateListener />         # app/components/AuthStateListener.tsx
        │     └── Supabase onAuthStateChange listener
        └── <StoreProvider>              # app/StoreProvider.tsx
              └── <Provider store={}>    # Redux store
                    └── <ThemeProvider>  # next-themes
                          └── {children}
```

### Admin Layout (Additional Wrapping)

```
app/admin/layout.tsx
  └── <AdminAuthWrapper>               # AdminAuthManager validation
        └── <div>                      # Admin page container
              └── {children}
        └── <AdminDebugInfo />         # Debug panel (dev)
```

---

## 12. Content System (Blog)

```
┌──────────────────────────────────────────┐
│           CONTENTLAYER2 PIPELINE         │
│                                          │
│  data/blog/*.mdx                         │
│       │                                  │
│       v                                  │
│  ┌────────────────┐                      │
│  │ Remark Plugins  │                     │
│  │ • remarkGfm     │  (GitHub Markdown)  │
│  │ • remarkMath    │  (LaTeX equations)  │
│  │ • remarkAlert   │  (GitHub alerts)    │
│  │ • remarkCodeTitles │                  │
│  │ • remarkImgToJsx│                     │
│  └────────┬───────┘                      │
│           v                              │
│  ┌────────────────┐                      │
│  │ Rehype Plugins  │                     │
│  │ • rehypeSlug    │  (heading IDs)      │
│  │ • rehypeAutolink│  (heading links)    │
│  │ • rehypeKatex   │  (math rendering)   │
│  │ • rehypePrism   │  (syntax highlight) │
│  │ • rehypeMinify  │  (HTML minify)      │
│  └────────┬───────┘                      │
│           v                              │
│  ┌────────────────┐                      │
│  │ Post-processing │                     │
│  │ • createTagCount() → tag-data.json    │
│  │ • createSearchIndex() → search.json   │
│  │ • computedFields: readingTime, toc    │
│  └────────────────┘                      │
│                                          │
│  Layouts: PostLayout, PostSimple,        │
│           PostBanner, ListLayout,        │
│           ListLayoutWithTags,            │
│           AuthorLayout                   │
└──────────────────────────────────────────┘
```

---

## 13. Security Architecture

### Rate Limiting

```
LRU Cache-based, per-IP rate limiting:

  /api/request              5 requests/minute
  /api/onsite/request       5 requests/minute
  /api/contact              3 requests/minute
  /api/admin/request-access 2 requests/minute

Implementation: lib/checkRateLimitFactory.ts
IP source: x-forwarded-for header
```

### Security Headers (next.config.js)

```
Content-Security-Policy:
  default-src 'self'
  script-src  'self' 'unsafe-eval' 'unsafe-inline' blob: giscus.app analytics.umami.is
  style-src   'self' 'unsafe-inline'
  img-src     * blob: data:
  connect-src *
  frame-src   giscus.app
  worker-src  'self' blob:

Referrer-Policy:         strict-origin-when-cross-origin
X-Frame-Options:         DENY
X-Content-Type-Options:  nosniff
HSTS:                    max-age=31536000; includeSubDomains
Permissions-Policy:      camera=(), microphone=(), geolocation=()
```

### Input Sanitization

- All user input HTML-escaped via `lib/messaging/escapeHtml.ts` in `handleAppointmentRequest()`
- Zod schema validation on all API endpoints accepting user data
- Hash-based verification for appointment confirmation URLs

### PostHog Proxy (Analytics Bypass)

```
next.config.js rewrites:
  /hostpog/static/*  → https://us-assets.i.posthog.com/static/*
  /hostpog/*         → https://us.i.posthog.com/*
  /hostpog/decide    → https://us.i.posthog.com/decide

Purpose: Avoid ad blockers that block posthog.com domains
```

---

## 14. Database Schema (Supabase)

```
┌──────────────────────────────────────────┐
│ supabase/migrations/                     │
│                                          │
│ 001_initial_schema.sql                   │
│   └── profiles table                     │
│       ├── id (uuid, FK → auth.users)     │
│       ├── email (text)                   │
│       ├── full_name (text)               │
│       ├── role ('user' | 'admin')        │
│       ├── avatar_url (text)              │
│       ├── created_at (timestamptz)       │
│       └── updated_at (timestamptz)       │
│                                          │
│ 002_auth_functions.sql                   │
│   └── Trigger: auto-create profile on    │
│       new user signup                    │
│                                          │
│ 003_admin_setup.sql                      │
│   └── Admin role setup and RLS policies  │
│                                          │
│ 004_add_admin_email.sql                  │
│   └── Admin email column additions       │
│                                          │
│ 005_fix_profile_insert.sql               │
│   └── Fix profile insert trigger         │
│                                          │
│ 006_fix_rls_recursion.sql                │
│   └── Fix RLS infinite recursion issue   │
└──────────────────────────────────────────┘
```

---

## 15. Testing Architecture

```
┌──────────────────────────────────────────────────────┐
│                   TEST PYRAMID                        │
│                                                       │
│                    /\                                  │
│                   /  \       Playwright E2E            │
│                  / E2E\      (tests/ directory)        │
│                 /______\                               │
│                /        \    Vitest Integration         │
│               / Integra- \   *.integration.test.ts     │
│              /   tion     \  (blocking scope, auth)    │
│             /______________\                           │
│            /                \  Vitest Unit              │
│           /   Unit Tests     \ *.test.ts               │
│          /  (components, lib) \ ~40 test files          │
│         /____________________\                        │
│                                                       │
│  Test Config:                                         │
│  • vitest.config.ts (unit + integration)              │
│  • playwright.config.ts (E2E, port 9999)              │
│  • jest.config.ts (legacy, being migrated)            │
│                                                       │
│  Key Test Areas:                                      │
│  • Auth: adminAuth, userAuth, requireAdmin            │
│  • Booking: BookingForm, handleSubmit, schema          │
│  • Availability: slots, busy times, intervals         │
│  • API routes: validate, request                       │
│  • Components: LocationField, PaymentMethod           │
└──────────────────────────────────────────────────────┘
```

---

## 16. Build Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                      BUILD PIPELINE                            │
│                                                                │
│  pnpm dev                                                      │
│  └── next dev --port 9876                                      │
│                                                                │
│  pnpm build                                                    │
│  └── next build --webpack                                      │
│      └── contentlayer2 processes data/blog/*.mdx               │
│          └── generates .contentlayer/generated/                 │
│      └── webpack strips dev-mode-prod-excluded/ in prod        │
│      └── postbuild.mjs                                         │
│          └── generates RSS feed (scripts/rss.mjs)              │
│                                                                │
│  pnpm build:staged                                             │
│  └── scripts/build-staged.sh                                   │
│      └── Only builds if staged files affect build              │
│                                                                │
│  Pre-commit (Husky + lint-staged):                             │
│  ├── ESLint --fix on *.{js,jsx,ts,tsx}                         │
│  ├── cspell (spellcheck, non-blocking)                         │
│  └── Prettier --write on *.{js,jsx,ts,tsx,json,css,md,mdx}    │
│                                                                │
│  Plugins in next.config.js:                                    │
│  ├── withContentlayer (MDX processing)                         │
│  └── withBundleAnalyzer (ANALYZE=true)                         │
└────────────────────────────────────────────────────────────────┘
```

---

## 17. Page Route Map

```
PUBLIC ROUTES:
  /                          Home page
  /landing                   Landing page
  /book                      Booking page
  /[bookingSlug]             Dynamic promo booking routes
  /about                     About page
  /faq                       FAQ page
  /contact                   Contact form
  /pricing                   Pricing page
  /services                  Services listing
  /reviews                   Reviews listing
  /reviews/rate              Submit a review
  /reviews/submitted         Review confirmation
  /blog                      Blog listing
  /blog/[...slug]            Blog post detail
  /blog/page/[page]          Blog pagination
  /tags                      All tags
  /tags/[tag]                Tag-filtered posts
  /confirmation              Booking confirmation
  /instantConfirm            Instant booking confirmation
  /onsite                    On-site booking

PROTECTED ROUTES (require Supabase auth):
  /my_events                 User's booked events
  /event/[event_id]          Event detail
  /event/[event_id]/next     Next available slot
  /event/[event_id]/adjacent Adjacent events

AUTH ROUTES:
  /auth/login                Login page
  /auth/callback/supabase    OAuth callback

ADMIN ROUTES (require admin role):
  /admin                     Admin dashboard
  /admin/[bookingSlug]       Admin booking management
  /admin/booked              Booked appointments
  /admin/active-event-containers  Active event view
  /admin/event/[event_id]    Admin event management
  /admin/gmail-events        Gmail Soothe sync
  /admin/reviews-list        Review management
  /admin/promo-routes        Promo code management
  /admin/request-access      Admin access requests
  /admin/mock-form-validators  Form validator testing
  /admin/mocked_user_flow    Mocked booking E2E tester
  /admin/test-dynamic-fields Dynamic field testing
  /admin-request-access      Public admin access request page
```

---

## 18. Environment Variables

```
# Google APIs (Calendar + Gmail + Auth)
GOOGLE_OAUTH_CLIENT_ID          OAuth2 client ID
GOOGLE_OAUTH_SECRET             OAuth2 secret (also used for HMAC signing)
GOOGLE_OAUTH_REFRESH            OAuth2 refresh token
GOOGLE_MAPS_API_KEY             Maps/Distance Matrix API
GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID  Default event for drive time

# Supabase
NEXT_PUBLIC_SUPABASE_URL        Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   Public anon key
SUPABASE_SERVICE_ROLE_KEY       Admin operations key

# Admin
ADMIN_EMAILS                    Comma-separated admin email list

# Analytics
NEXT_PUBLIC_POSTHOG_KEY_PROD    PostHog production API key
NEXT_PUBLIC_POSTHOG_KEY_DEV     PostHog development API key
NEXT_PUBLIC_DISABLE_POSTHOG     Disable analytics (true/false)

# Push Notifications
PUSHOVER_TOKEN                  Pushover app token
PUSHOVER_USER                   Pushover user key

# Email
OWNER_EMAIL                     Business email address
OWNER_NAME                      Business owner name
OWNER_PHONE_NUMBER              Contact phone number

# Optional
COOKIE_DOMAIN                   Custom cookie domain
PROXY_DEBUG                     Enable middleware logging
USE_MOCK_CALENDAR_DATA          Use mock data instead of Google API
BASE_PATH                       URL base path override
```

---

## 19. MCP Server

```
┌────────────────────────────────────────┐
│  mcp-server.ts (standalone, stdio)     │
│                                        │
│  Tools exposed:                        │
│  ┌──────────────────────────────────┐  │
│  │ get_calendar_events              │  │
│  │ → Search/retrieve Google         │  │
│  │   Calendar events                │  │
│  ├──────────────────────────────────┤  │
│  │ create_calendar_event            │  │
│  │ → Create new calendar event      │  │
│  ├──────────────────────────────────┤  │
│  │ search_emails                    │  │
│  │ → Search Gmail with Gmail syntax │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Schema defs: src/lib/mcp/schemas.ts   │
│  Tool impls:  src/lib/mcp/tools/       │
└────────────────────────────────────────┘
```

---

## 20. Observations & Notes

### Dual Auth Complexity
The three auth systems (Supabase, AdminAuthManager, UserAuthServerManager) serve
different purposes but create maintenance overhead. The HMAC-token systems predate the
Supabase integration and may be candidates for eventual consolidation.

### Event Container Pattern
The `{slug}__EVENT__MEMBER__` / `{slug}__EVENT__CONTAINER__` naming convention in Google
Calendar events is a creative solution for multi-event blocking that avoids needing a
separate database for event metadata. It does tie the system to Google Calendar as the
source of truth.

### No Middleware File
The app uses `proxy.ts` (not `middleware.ts`) for its middleware layer. The Next.js config
imports it differently — this is a Supabase SSR pattern for managing auth cookies on every
request.

### Strict Null Checks
TypeScript `strict` is `false` but `strictNullChecks` is `true`. This is a pragmatic
compromise — full strict mode would likely require significant refactoring.

### Dev-Mode Exclusion
The webpack config strips `dev-mode-prod-excluded/` files from production builds using
`ignore-loader`. This keeps test utilities out of production bundles.

### PostHog Proxy Pattern
Analytics are proxied through `/hostpog/*` rewrites to bypass ad blockers. The proxy
distinguishes between dev and prod PostHog keys based on the hostname.

---

*End of Architecture Audit*
