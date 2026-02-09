# Architecture Audit: Trillium Massage

**Date:** 2026-02-09
**App:** trilliummassage.la
**Stack:** Next.js 16 / React 19 / TypeScript 5.9 / Supabase / Redux Toolkit

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Route Map](#4-route-map)
5. [Authentication Architecture](#5-authentication-architecture)
6. [Data Flow](#6-data-flow)
7. [State Management](#7-state-management)
8. [External Service Integrations](#8-external-service-integrations)
9. [Messaging Pipeline](#9-messaging-pipeline)
10. [Content System](#10-content-system)
11. [Component Architecture](#11-component-architecture)
12. [Security Model](#12-security-model)
13. [Technology Stack](#13-technology-stack)
14. [Findings & Observations](#14-findings--observations)

---

## 1. System Overview

Trillium Massage is a full-stack booking platform for an in-home massage therapy
business in the LA metro area. It handles real-time availability checking against
Google Calendar, appointment booking with multi-step confirmation flows, admin
management, client notifications, reviews, a blog, and analytics.

```
+=========================================================================+
|                        TRILLIUM MASSAGE PLATFORM                        |
|                                                                         |
|  +------------------+  +------------------+  +---------------------+    |
|  |   Public Site    |  |  Booking Engine  |  |   Admin Dashboard   |    |
|  |                  |  |                  |  |                     |    |
|  |  Landing         |  |  Availability    |  |  Event Management   |    |
|  |  About/FAQ       |  |  Calendar Picker |  |  Gmail Sync         |    |
|  |  Services        |  |  Booking Form    |  |  Promo Routes       |    |
|  |  Reviews         |  |  Confirmation    |  |  Reviews Admin      |    |
|  |  Blog            |  |  Instant Confirm |  |  User Flow Tester   |    |
|  |  Pricing         |  |  On-Site Booking |  |  Config Debug       |    |
|  +------------------+  +------------------+  +---------------------+    |
|                                                                         |
|  +-----------------------------------------------------------------+    |
|  |                         API Layer (24 routes)                    |    |
|  |  request | confirm | contact | events | admin | auth | tiles    |    |
|  +-----------------------------------------------------------------+    |
|                                                                         |
|  +-----------------------------------------------------------------+    |
|  |                     External Services                            |    |
|  |  Google Calendar | Gmail | Pushover | PostHog | Supabase | Maps |    |
|  +-----------------------------------------------------------------+    |
+=========================================================================+
```

---

## 2. High-Level Architecture

```
                            +------------------+
                            |     Browser      |
                            |                  |
                            |  React 19 SPA    |
                            |  Redux Store     |
                            |  PostHog Client  |
                            +--------+---------+
                                     |
                                     | HTTPS
                                     v
                            +------------------+
                            |   Next.js 16     |
                            |   App Router     |
                            |                  |
                            |  Server Comps    |
                            |  API Routes      |
                            |  SSR / ISR       |
                            +--------+---------+
                                     |
                    +----------------+----------------+
                    |                |                 |
                    v                v                 v
           +-------+------+  +------+------+  +------+------+
           | Google APIs   |  |  Supabase   |  |  Pushover   |
           |               |  |             |  |             |
           | Calendar v3   |  | PostgreSQL  |  | Push Notif  |
           | Gmail v1      |  | Auth        |  |             |
           | Maps          |  | Profiles    |  |             |
           +-------+------+  +------+------+  +------+------+
                   |
                   v
           +-------+------+
           |  Gmail SMTP   |
           |  (Nodemailer) |
           |               |
           | Admin Emails  |
           | Client Emails |
           +--------------+
```

### Request Lifecycle

```
  Client Request
       |
       v
  +----+----+
  | Next.js |---> Static assets (public/, .next/)
  | Router  |
  +----+----+
       |
       +--------> Server Components (SSR)
       |              |
       |              v
       |          Contentlayer (blog/authors MDX)
       |
       +--------> API Routes (/api/*)
       |              |
       |              +---> Zod Validation
       |              +---> Rate Limiting (LRU Cache)
       |              +---> Auth Check (Admin/User)
       |              +---> Google Calendar API
       |              +---> Email (Nodemailer)
       |              +---> Push (Pushover)
       |
       +--------> Client Components
                      |
                      v
                  Redux Store <---> localStorage
                  PostHog Analytics
                  MapLibre GL Maps
```

---

## 3. Directory Structure

```
/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (theme, analytics, header/footer)
│   ├── page.tsx                  # Home page
│   ├── theme-providers.tsx       # Provider tree (PostHog > Auth > Redux > Theme)
│   ├── StoreProvider.tsx         # Redux store initialization
│   │
│   ├── [bookingSlug]/            # Dynamic promo/booking routes
│   ├── about/                    # About page
│   ├── admin/                    # Admin dashboard (layout-protected)
│   │   ├── layout.tsx            # AdminAuthWrapper guard
│   │   ├── [bookingSlug]/        # Admin booking management
│   │   ├── active-event-containers/
│   │   ├── booked/               # Booked appointments list
│   │   ├── event/[event_id]/     # Individual event management
│   │   ├── gmail-events/         # Soothe email sync
│   │   ├── mock-form-validators/ # Testing tools
│   │   ├── mocked_user_flow/     # Multi-step flow tester
│   │   ├── promo-routes/         # Promotional route config
│   │   ├── request-access/       # Access request management
│   │   ├── reviews-list/         # Review management
│   │   └── test-dynamic-fields/  # Field testing
│   │
│   ├── api/                      # API routes (24 endpoints)
│   │   ├── admin/                # Admin-only endpoints
│   │   │   ├── configuration/[slug]/
│   │   │   ├── create-appointment/
│   │   │   ├── gmail/soothe-bookings/
│   │   │   ├── request-access/
│   │   │   └── validate/
│   │   ├── auth/supabase/        # Supabase auth endpoints
│   │   │   ├── admin/{promote,demote,users}/
│   │   │   └── profile/
│   │   ├── confirm/              # Booking confirmation
│   │   ├── contact/              # Contact form
│   │   ├── driveTime/            # Google Maps drive time
│   │   ├── events/               # Calendar events CRUD
│   │   ├── loc/                  # Location/geocoding
│   │   ├── newsletter/           # Newsletter signup
│   │   ├── onsite/{request,confirm}/
│   │   ├── request/              # Main booking endpoint
│   │   ├── review/create/        # Review submission
│   │   ├── tiles/[z]/[x]/[y]/   # Map tile proxy
│   │   └── user/validate/        # User token validation
│   │
│   ├── auth/                     # Auth pages
│   │   ├── login/
│   │   ├── callback/supabase/    # OAuth callback handler
│   │   └── test-login/
│   │
│   ├── blog/                     # Blog (Contentlayer MDX)
│   │   ├── [...slug]/            # Dynamic blog posts
│   │   └── page/[page]/          # Pagination
│   │
│   ├── book/                     # Booking page
│   ├── confirmation/             # Post-booking confirmation
│   ├── contact/                  # Contact form
│   ├── event/[event_id]/         # Event detail + adjacent/next
│   ├── faq/                      # FAQ section
│   ├── instantConfirm/           # Instant confirmation flow
│   ├── landing/                  # Landing page
│   ├── my_events/                # User's booked events
│   ├── onsite/                   # On-site booking
│   ├── pricing/                  # Pricing page
│   ├── reviews/                  # Reviews + rate + submitted
│   ├── services/                 # Services listing
│   └── tags/                     # Blog tag filtering
│
├── components/                   # Reusable React components (~90 files)
│   ├── admin/                    # Admin-specific components
│   ├── auth/                     # Auth components (admin + supabase)
│   ├── availability/             # Calendar/time picker components
│   ├── booking/                  # Booking form + fields + features
│   ├── hero/                     # Hero section
│   ├── landingPage/              # Landing page sections
│   ├── masonry/                  # Image grid layout
│   ├── skeletons/                # Loading states
│   ├── social-icons/             # Social media icons
│   ├── ui/                       # Atomic UI components
│   └── *.tsx                     # Top-level shared components
│
├── lib/                          # Core business logic (~100 files)
│   ├── availability/             # Slot calculation engine (14 files)
│   ├── fetch/                    # Data fetching utilities
│   ├── gmail/                    # Gmail API integration
│   ├── helpers/                  # General helpers
│   ├── messaging/                # Email + push notification templates
│   │   ├── email/admin/          # 6 admin email templates
│   │   ├── email/client/         # 3 client email templates
│   │   ├── push/admin/           # 3 push notification templates
│   │   ├── templates/            # Shared email templates
│   │   └── utilities/            # Messaging helpers
│   ├── slugConfigurations/       # Per-slug booking configs
│   ├── supabase/                 # Supabase client utilities
│   ├── *Types.ts                 # Type definitions (13 type modules)
│   └── *.ts                      # Core utilities (auth, hash, schema, etc.)
│
├── redux/                        # State management
│   ├── store.ts                  # Redux store configuration
│   ├── hooks.ts                  # Typed hooks + convenience selectors
│   └── slices/                   # 7 Redux slices
│
├── data/                         # Static content & configuration
│   ├── blog/                     # Blog posts (MDX)
│   ├── authors/                  # Author profiles (MDX)
│   ├── ratings-*.ts              # Platform-specific review data
│   ├── siteMetadata.js           # Global site config
│   └── *.ts                      # Nav links, services, payments
│
├── layouts/                      # Blog/content page layouts (6)
├── context/                      # React Context (PostHog analytics)
├── features/                     # Feature components (1)
├── css/                          # Tailwind + Prism styles
├── scripts/                      # Build & utility scripts (16)
├── supabase/                     # Database migrations (6)
├── src/lib/mcp/                  # MCP server tools (calendar, email)
├── types/                        # Global TypeScript declarations
├── tests/                        # E2E test directory
└── docs/                         # Documentation
```

---

## 4. Route Map

### Public Pages

```
/                         Home (Main.tsx)
/landing                  Landing page (multi-section)
/about                    About page
/book                     Booking page (availability + form)
/pricing                  Pricing info
/services                 Service listings
/faq                      FAQ
/contact                  Contact form
/reviews                  Review display
/reviews/rate             Submit a review
/reviews/submitted        Review confirmation
/confirmation             Booking confirmation
/instantConfirm           Instant booking confirmation
/onsite                   On-site booking request
/[bookingSlug]            Dynamic promo/booking routes
/event/[event_id]         Event details
/event/[event_id]/next    Next available slot
/event/[event_id]/adjacent Adjacent events
/my_events                User's booked events (token-gated)
```

### Blog Routes

```
/blog                     Blog listing
/blog/[...slug]           Individual blog post
/blog/page/[page]         Paginated blog listing
/tags                     All tags
/tags/[tag]               Posts by tag
/tags/[tag]/page/[page]   Paginated tag view
```

### Auth Routes

```
/auth/login               Login page (Supabase)
/auth/callback/supabase   OAuth callback handler
/admin-request-access     Request admin access
```

### Admin Routes (Layout-Protected)

```
/admin                         Dashboard
/admin/[bookingSlug]           Booking slug management
/admin/active-event-containers Active events
/admin/booked                  Booked appointments
/admin/event/[event_id]        Event management
/admin/gmail-events            Soothe email sync
/admin/mock-form-validators    Form validator testing
/admin/mocked_user_flow        Multi-step booking flow tester
/admin/promo-routes            Promo route management
/admin/request-access          Access request admin
/admin/reviews-list            Reviews management
/admin/test-dynamic-fields     Dynamic field testing
```

### API Routes (24 Endpoints)

```
POST /api/request                          Main booking request
GET  /api/confirm                          Booking confirmation
POST /api/contact                          Contact form
POST /api/newsletter                       Newsletter signup
GET  /api/driveTime                        Drive time calculation
GET  /api/loc                              Location/geocoding
GET  /api/events/[event_id]                Fetch event
GET  /api/events/byEmail                   Events by user email
POST /api/events/update                    Update event
POST /api/onsite/request                   On-site booking request
GET  /api/onsite/confirm                   On-site confirmation
POST /api/review/create                    Submit review
GET  /api/tiles/[z]/[x]/[y]               Map tile proxy
POST /api/user/validate                    User token validation
POST /api/admin/validate                   Admin token validation
POST /api/admin/create-appointment         Direct appointment creation
GET  /api/admin/configuration/[slug]       Slug configuration
POST /api/admin/request-access             Admin access request
GET  /api/admin/gmail/soothe-bookings      Soothe email extraction
GET  /api/auth/supabase/admin/users        List users
POST /api/auth/supabase/admin/promote      Promote to admin
POST /api/auth/supabase/admin/demote       Demote admin
GET  /api/auth/supabase/profile            User profile
GET  /api/auth/callback/supabase           OAuth callback
```

---

## 5. Authentication Architecture

The app has **three distinct auth systems** running in parallel:

```
+================================================================+
|                    AUTHENTICATION LAYERS                         |
|                                                                  |
|  +-------------------+  +------------------+  +--------------+  |
|  | 1. Admin Auth     |  | 2. User Auth     |  | 3. Supabase  |  |
|  | (HMAC Tokens)     |  | (HMAC Tokens)    |  | (OAuth/Email)|  |
|  |                   |  |                  |  |              |  |
|  | adminAuth.ts      |  | userAuth.ts      |  | supabase/    |  |
|  | adminFetch.ts     |  | userAuthServer.ts|  |  client.ts   |  |
|  |                   |  |                  |  |  server.ts   |  |
|  | Storage:          |  | Storage:         |  | Storage:     |  |
|  |  localStorage     |  |  localStorage    |  |  Cookies     |  |
|  |                   |  |                  |  |              |  |
|  | Guards:           |  | Guards:          |  | Guards:      |  |
|  |  AdminAuthWrapper |  |  URL params      |  |  AuthGuard   |  |
|  |  requireAdmin()   |  |  validate route  |  |  getUser()   |  |
|  +-------------------+  +------------------+  +--------------+  |
+================================================================+
```

### Auth System 1: Admin Auth (HMAC-Signed Tokens)

```
  Admin Link Generation (CLI script)
       |
       v
  generateAdminLink(email, baseUrl)
       |
       +---> generateSignedToken(email)
       |         |
       |         v
       |     payload = "email:expiry"
       |     signature = HMAC-SHA256(payload, GOOGLE_OAUTH_SECRET)
       |     token = base64(payload + "|" + signature)
       |
       v
  URL: /admin?email=x&token=y
       |
       v
  AdminAuthWrapper (layout guard)
       |
       +---> validateAdminAccess(email, token)
       |         |
       |         +---> atob(token)
       |         +---> split payload and signature
       |         +---> verify HMAC signature
       |         +---> check email match
       |         +---> check expiration (15 days)
       |
       +---> createSession(email, token)
       |         |
       |         v
       |     localStorage["admin_session"] = {
       |       email, token, timestamp,
       |       expiresAt: now + 30 days
       |     }
       |
       v
  Subsequent Requests: adminFetch()
       |
       +---> headers["x-admin-email"] = session.email
       +---> headers["x-admin-token"] = session.token
       |
       v
  API Route: requireAdmin(request)
       |
       +---> Extract x-admin-email, x-admin-token
       +---> validateAdminAccess(email, token)
       +---> Return { email } or 401
```

### Auth System 2: User Auth (HMAC-Signed Tokens)

```
  User Link Generation (email template or CLI)
       |
       v
  generateMyEventsLink(email, baseUrl)
       |
       v
  URL: /my_events?email=x&token=y
       |
       v
  UserAuthManager.createSession(email, token)
       |
       v
  localStorage["user_session"] = {
    email, token, timestamp,
    expiresAt: now + 30 days
  }
```

### Auth System 3: Supabase Auth

```
  Login Form
       |
       v
  Supabase signInWithOtp() / signInWithPassword()
       |
       v
  /auth/callback/supabase (OAuth redirect)
       |
       v
  Supabase manages cookies via @supabase/ssr
       |
       v
  Server: getUser() / getSession() / isAdmin()
       |
       v
  Client: SupabaseAuthProvider (context)
       |
       v
  Profile: supabase.from('profiles').select('*')
           role === 'admin' for admin access
```

---

## 6. Data Flow

### Booking Flow (Primary User Journey)

```
  +----------+     +-----------+     +-----------+     +------------+
  |  Landing  | --> |  /book    | --> |  Select   | --> |  Fill Form |
  |  Page     |     |  Page     |     |  Time     |     |  (Formik)  |
  +----------+     +-----+-----+     +-----+-----+     +------+-----+
                         |                  |                   |
                         v                  v                   v
                   Fetch Busy Times   Redux: setSlots    Redux: setForm
                   (Google Calendar)  setSelectedDate    setSelectedTime
                         |            setDuration
                         v
              +----------+----------+
              | getAvailability()   |
              |                     |
              | Input:              |
              |  potential slots    |
              |  busy times         |
              |  lead time (3 hrs)  |
              |  padding (0 min)    |
              |                     |
              | Algorithm:          |
              |  1. Filter past     |
              |  2. Add lead buffer |
              |  3. Check overlaps  |
              |  4. Return free     |
              +----------+----------+
                         |
                         v
                  Available Slots
                  Shown in Calendar UI
                         |
                         v
              +----------+----------+
              |  User Submits Form  |
              +----------+----------+
                         |
         +---------------+---------------+
         |                               |
         v                               v
  +------+-------+              +--------+-------+
  | Standard     |              | Instant        |
  | (Approval)   |              | Confirm        |
  +------+-------+              +--------+-------+
         |                               |
         v                               v
  1. Zod Validation              1. Zod Validation
  2. HTML Escape                 2. HTML Escape
  3. Rate Limit Check            3. Rate Limit Check
  4. Generate Approval URL       4. Create Calendar Event
  5. Send Admin Approval Email   5. Send Pushover (instant)
  6. Send Pushover               6. Send Confirm Email
  7. Send Client Request Email   7. Return success
  8. Return success
         |
         v
  Admin Clicks Approve URL
         |
         v
  /api/confirm
         |
         v
  1. Validate hash
  2. Create Calendar Event
  3. Send Client Confirm Email
  4. Return success
```

### Availability Calculation Pipeline

```
  config.ts                    Google Calendar API
       |                              |
       v                              v
  OWNER_AVAILABILITY           getBusyTimes()
  (10am-11pm, 7 days)         (freeBusy endpoint)
       |                              |
       v                              v
  getPotentialTimes()          DateTimeInterval[]
       |                        (busy periods)
       v                              |
  StringDateTimeInterval[]             |
  (all possible slots)                |
       |                              |
       +----------+-------------------+
                  |
                  v
           getAvailability()
                  |
                  v
           Filter: past slots
           Filter: lead time (now + 3hr)
           Filter: busy overlap + padding
                  |
                  v
           Available Slots
                  |
                  v
           Redux: availabilitySlice
```

### Event Container System

```
  Google Calendar Event Naming Convention:

  Regular Event:
    Summary: "90min Massage - John Doe"

  Event Container (multi-booking block):
    Summary: "airbnb__EVENT__CONTAINER__Feb 10"
    Members: "airbnb__EVENT__MEMBER__Jane Smith 90min"

  Blocking Scopes:
  +-----------+--------------------------------------------+
  | 'event'   | Only blocks within same event container    |
  | 'general' | Blocks across ALL calendar events          |
  +-----------+--------------------------------------------+

  Flow:
  fetchContainersByQuery(slug)
       |
       v
  Google Calendar: search for "{slug}__EVENT__"
       |
       v
  Filter: __EVENT__MEMBER__ (booked slots)
  Filter: __EVENT__CONTAINER__ (time blocks)
       |
       v
  Build busy times from member events
       |
       v
  getAvailability() with container-derived busy times
```

---

## 7. State Management

### Redux Store Architecture

```
  +================================================================+
  |                        REDUX STORE                              |
  |                                                                 |
  |  +------------------+  +------------------+  +---------------+  |
  |  | formSlice        |  | availabilitySlice|  | configSlice   |  |
  |  |                  |  |                  |  |               |  |
  |  | firstName        |  | start / end      |  | bookingSlug   |  |
  |  | lastName         |  | selectedDate     |  | pricing {}    |  |
  |  | email            |  | selectedTime     |  | allowedDurations|
  |  | phone            |  | duration         |  | location {}   |  |
  |  | location {}      |  | timeZone         |  | discount      |  |
  |  | paymentMethod    |  | slots []         |  | instantConfirm|  |
  |  | hotelRoomNumber  |  | driveTime        |  | blockingScope |  |
  |  | parkingInstr.    |  | adjacencyBuffer  |  | customFields  |  |
  |  | additionalNotes  |  +------------------+  +---------------+  |
  |  | promo            |                                           |
  |  | bookingUrl       |  +------------------+  +---------------+  |
  |  +------------------+  | authSlice        |  | modalSlice    |  |
  |                        |                  |  |               |  |
  |  +------------------+  | isAuthenticated  |  | status:       |  |
  |  | eventContainers  |  | adminEmail       |  |  open|busy    |  |
  |  |                  |  +------------------+  |  error|closed  |  |
  |  | location {}      |                        +---------------+  |
  |  | eventBaseString  |  +------------------+                     |
  |  | eventMemberStr   |  | readySlice       |                     |
  |  | eventContainerStr|  |                  |                     |
  |  +------------------+  | Calendar: bool   |                     |
  |                        | TimeList: bool   |                     |
  |                        | hidden: bool     |                     |
  |                        +------------------+                     |
  +================================================================+
```

### Provider Tree

```
  <html>
    <body>
      <ThemeProviders>              -- theme-providers.tsx
        |
        +-- <CSPostHogProvider>     -- context/AnalyticsContext.tsx
        |     |
        |     +-- <AuthStateListener>  -- Supabase auth state sync
        |     |
        |     +-- <StoreProvider>   -- Redux store
        |           |
        |           +-- <ThemeProvider>  -- next-themes (dark mode)
        |                 |
        |                 +-- <SearchProvider>  -- pliny/search (kbar)
        |                       |
        |                       +-- <Header />
        |                       +-- <main>{children}</main>
        |                       +-- <Footer />
        |                       +-- <Toaster />  -- sonner toasts
      </ThemeProviders>
    </body>
  </html>
```

---

## 8. External Service Integrations

```
  +================================================================+
  |                   EXTERNAL SERVICES MAP                         |
  |                                                                 |
  |  +--------------------------+  +---------------------------+    |
  |  | Google Calendar API v3   |  | Gmail API v1              |    |
  |  |                          |  |                           |    |
  |  | Auth: OAuth2 refresh     |  | Auth: OAuth2 refresh      |    |
  |  |   token flow             |  |   token flow              |    |
  |  |                          |  |                           |    |
  |  | Endpoints:               |  | Endpoints:                |    |
  |  |  POST /freeBusy          |  |  GET /messages (search)   |    |
  |  |  GET  /events (search)   |  |  GET /messages/{id}       |    |
  |  |  GET  /events/{id}       |  |                           |    |
  |  |  POST /events (create)   |  | Use: Soothe booking       |    |
  |  |                          |  |   email extraction         |    |
  |  | Calendars checked:       |  +---------------------------+    |
  |  |  - primary               |                                   |
  |  |  - trillium@             |  +---------------------------+    |
  |  |    hatsfabulous.com      |  | Gmail SMTP (Nodemailer)   |    |
  |  |  - trillium@             |  |                           |    |
  |  |    trilliumsmith.com     |  | Host: smtp.gmail.com:465  |    |
  |  +--------------------------+  | Auth: OAuth2              |    |
  |                                |                           |    |
  |  +--------------------------+  | Templates: 9 HTML emails  |    |
  |  | Supabase                 |  |  - Admin: 6 templates     |    |
  |  |                          |  |  - Client: 3 templates    |    |
  |  | PostgreSQL database      |  +---------------------------+    |
  |  | Auth (OAuth + email)     |                                   |
  |  | Row Level Security       |  +---------------------------+    |
  |  | Profiles table           |  | Pushover                  |    |
  |  | Admin role management    |  |                           |    |
  |  |                          |  | Push notifications to     |    |
  |  | 6 migrations:            |  |   admin mobile device     |    |
  |  |  initial_schema          |  |                           |    |
  |  |  auth_functions          |  | Templates:                |    |
  |  |  admin_setup             |  |  - AppointmentPushover    |    |
  |  |  add_admin_email         |  |  - InstantConfirm         |    |
  |  |  fix_profile_insert      |  |  - ContactPushover        |    |
  |  |  fix_rls_recursion       |  +---------------------------+    |
  |  +--------------------------+                                   |
  |                                +---------------------------+    |
  |  +--------------------------+  | PostHog Analytics         |    |
  |  | MapLibre GL / Tiles      |  |                           |    |
  |  |                          |  | Self-hosted proxy:        |    |
  |  | Map display for          |  |   /hostpog/* -> us.posthog|    |
  |  |   service area           |  |                           |    |
  |  | Tile proxy:              |  | Events:                   |    |
  |  |   /api/tiles/[z]/[x]/[y]|  |  identify (on booking)    |    |
  |  | Drive time calculation   |  |  capture (custom events)  |    |
  |  |   via Google Maps        |  |  test_user marking        |    |
  |  +--------------------------+  +---------------------------+    |
  +================================================================+
```

### Google OAuth Token Flow

```
  Environment Variables:
    GOOGLE_OAUTH_CLIENT_ID
    GOOGLE_OAUTH_SECRET
    GOOGLE_OAUTH_REFRESH
         |
         v
  POST https://oauth2.googleapis.com/token
    grant_type=refresh_token
    client_id=...
    client_secret=...
    refresh_token=...
         |
         v
  access_token (short-lived)
         |
         v
  Authorization: Bearer {access_token}
         |
         +---> Google Calendar API calls
         +---> Gmail API calls
```

---

## 9. Messaging Pipeline

```
  +================================================================+
  |                    MESSAGING PIPELINE                            |
  |                                                                 |
  |  Trigger Event                                                  |
  |       |                                                         |
  |       +---> Booking Request (standard)                          |
  |       |       |                                                 |
  |       |       +---> [Admin] ApprovalEmail                       |
  |       |       +---> [Admin] AppointmentPushover                 |
  |       |       +---> [Client] ClientRequestEmail                 |
  |       |                                                         |
  |       +---> Booking Request (instant confirm)                   |
  |       |       |                                                 |
  |       |       +---> [Admin] AppointmentPushoverInstantConfirm   |
  |       |       +---> [Client] ClientConfirmEmail                 |
  |       |                                                         |
  |       +---> Booking Approved                                    |
  |       |       |                                                 |
  |       |       +---> [Client] ClientConfirmEmail                 |
  |       |                                                         |
  |       +---> Contact Form                                        |
  |       |       |                                                 |
  |       |       +---> [Admin] contactFormEmail                    |
  |       |       +---> [Admin] ContactPushover                     |
  |       |       +---> [Client] contactFormConfirmation            |
  |       |                                                         |
  |       +---> On-Site Request                                     |
  |       |       |                                                 |
  |       |       +---> [Admin] OnSiteRequestEmail                  |
  |       |       +---> [Client] ClientRequestEmail                 |
  |       |                                                         |
  |       +---> Review Submitted                                    |
  |       |       |                                                 |
  |       |       +---> [Admin] ReviewSubmissionEmail               |
  |       |                                                         |
  |       +---> Admin Access Request                                |
  |               |                                                 |
  |               +---> [Admin] AdminAccessEmail                    |
  |                                                                 |
  |  Security:                                                      |
  |   - All user data HTML-escaped via escapeHtml()                 |
  |   - Email addresses validated by Zod schema                     |
  +================================================================+
```

---

## 10. Content System

### Contentlayer Pipeline

```
  data/blog/*.mdx
  data/authors/*.mdx
       |
       v
  contentlayer.config.ts
       |
       +---> Document Types:
       |       Blog (title, date, tags, summary, authors, draft)
       |       Authors (name, avatar, occupation, email, social)
       |
       +---> Computed Fields:
       |       readingTime, slug, path, filePath, toc
       |       structuredData (JSON-LD for SEO)
       |
       +---> Remark Plugins:
       |       remarkGfm, remarkMath, remarkAlert
       |       remarkCodeTitles, remarkImgToJsx
       |
       +---> Rehype Plugins:
       |       rehypeSlug, rehypeAutolinkHeadings
       |       rehypeKatex, rehypePrismPlus
       |       rehypePresetMinify
       |
       +---> Post-build:
               createTagCount() -> app/tag-data.json
               createSearchIndex() -> public/search.json

  Layouts for rendering:
    PostLayout, PostSimple, PostBanner
    ListLayout, ListLayoutWithTags
    AuthorLayout
```

### Static Data Files

```
  data/
  ├── siteMetadata.js         Site config (title, URLs, analytics, search)
  ├── headerNavLinks.ts       Navigation: /book, /reviews, /about, /faq
  ├── authHeaderNavLinks.ts   Authenticated nav links
  ├── servicesData.ts         Services catalog (5 massage types)
  ├── paymentMethods.ts       Payment options (cash, venmo, cashapp, etc.)
  ├── projectsData.ts         Portfolio projects
  ├── ratings.ts              Combined ratings export
  ├── ratings-airbnb.ts       Airbnb reviews
  ├── ratings-soothe.ts       Soothe platform reviews
  └── ratings-trillium.ts     Direct Trillium reviews
```

---

## 11. Component Architecture

### Component Hierarchy (Booking Flow)

```
  BookingForm.tsx
  |
  +-- InitializeBookingState.tsx     (reads URL params, hydrates Redux)
  |
  +-- DurationSlotManager.tsx        (duration selection + slot fetching)
  |     |
  |     +-- EnhancedDurationPicker   (duration buttons)
  |     +-- Calendar                 (date grid)
  |     |     +-- DayButton          (individual day)
  |     +-- DynamicTimeList          (available times)
  |           +-- TimeList           (time button grid)
  |                 +-- TimeButton   (individual slot)
  |
  +-- BookingSummary.tsx             (selected date/time/duration/price)
  |
  +-- Form Fields:
  |     +-- NameFields.tsx           (first + last name)
  |     +-- EmailField.tsx
  |     +-- PhoneField.tsx
  |     +-- LocationField.tsx        (street/city/zip with validation)
  |     +-- HotelField.tsx           (conditional)
  |     +-- ParkingField.tsx         (conditional)
  |     +-- NotesField.tsx
  |     +-- PaymentMethodField.tsx   (radio buttons)
  |
  +-- DriveTimeCalculator.tsx        (Google Maps integration)
  |
  +-- BookingFormActions.tsx          (submit/reset buttons)
```

### Component Categories

```
  +--------------------+-------------------------------------------+
  | Category           | Count | Key Components                    |
  +--------------------+-------+-----------------------------------+
  | Top-level shared   |  ~30  | Header, Footer, Modal, Spinner   |
  | Booking            |  ~20  | BookingForm, fields, features     |
  | Availability       |   10  | Calendar, TimeList, DurationPicker|
  | Auth (admin)       |    7  | AuthWrapper, AuthProvider, Nav    |
  | Auth (supabase)    |    4  | AuthGuard, LoginForm, UserMenu   |
  | Admin              |    3  | ConfigSpy, DebugPanel, Tester    |
  | Landing page       |    8  | Hero, About, Pricing sections    |
  | Blog/content       |    6  | Layouts, MDX components          |
  | UI primitives      |   ~8  | GradientText, atoms              |
  | Skeletons          |    4  | Calendar, Time loading states    |
  +--------------------+-------+-----------------------------------+
```

---

## 12. Security Model

```
  +================================================================+
  |                      SECURITY LAYERS                            |
  |                                                                 |
  |  Layer 1: Transport                                             |
  |  +----------------------------------------------------------+  |
  |  | HTTPS enforced (HSTS: 31536000s, includeSubDomains)       |  |
  |  | CSP: default-src 'self', script-src + giscus/analytics    |  |
  |  | X-Frame-Options: DENY                                      |  |
  |  | X-Content-Type-Options: nosniff                            |  |
  |  | Referrer-Policy: strict-origin-when-cross-origin           |  |
  |  | Permissions-Policy: camera=(), microphone=(), geolocation=()|
  |  +----------------------------------------------------------+  |
  |                                                                 |
  |  Layer 2: Input Validation                                      |
  |  +----------------------------------------------------------+  |
  |  | Zod schemas on all API endpoints                           |  |
  |  |   AppointmentRequestSchema, OnSiteRequestSchema            |  |
  |  | HTML escaping on all user-provided data (escapeHtml)       |  |
  |  | Rate limiting: LRU cache, 5 req/IP/min                    |  |
  |  +----------------------------------------------------------+  |
  |                                                                 |
  |  Layer 3: Authentication                                        |
  |  +----------------------------------------------------------+  |
  |  | Admin: HMAC-SHA256 signed tokens (GOOGLE_OAUTH_SECRET)    |  |
  |  |   - 15-day token expiry, 30-day session expiry            |  |
  |  |   - requireAdmin() on all admin API routes                |  |
  |  | User: HMAC-SHA256 signed tokens (same secret)             |  |
  |  |   - Token validation on /my_events access                 |  |
  |  | Supabase: OAuth + Row Level Security                       |  |
  |  |   - Server-side getUser() validation                      |  |
  |  |   - Admin client uses service role key (server only)       |  |
  |  +----------------------------------------------------------+  |
  |                                                                 |
  |  Layer 4: Authorization                                         |
  |  +----------------------------------------------------------+  |
  |  | Admin layout: AdminAuthWrapper component guard             |  |
  |  | API routes: requireAdmin() header validation               |  |
  |  | Supabase RLS: Profile-based role checks                    |  |
  |  | Approval URLs: Hash-verified confirmation links            |  |
  |  +----------------------------------------------------------+  |
  |                                                                 |
  |  Layer 5: Analytics Privacy                                     |
  |  +----------------------------------------------------------+  |
  |  | PostHog self-hosted proxy (/hostpog/*)                     |  |
  |  | Separate dev/prod API keys                                 |  |
  |  | Test user marking for filtering                            |  |
  |  +----------------------------------------------------------+  |
  +================================================================+
```

---

## 13. Technology Stack

```
  +========================+==========================================+
  | Category               | Technology                               |
  +========================+==========================================+
  | Framework              | Next.js 16.0.7 (App Router)              |
  | Runtime                | React 19.2.0                             |
  | Language               | TypeScript 5.9                           |
  | Package Manager        | pnpm 9.15.0                              |
  +------------------------+------------------------------------------+
  | Styling                | Tailwind CSS 4.0.5 + @tailwindcss/forms  |
  |                        | @tailwindcss/typography                   |
  +------------------------+------------------------------------------+
  | State Management       | Redux Toolkit 2.5.0 (7 slices)           |
  | Forms                  | Formik 2.4.6 + Zod 4.0.10               |
  +------------------------+------------------------------------------+
  | Database               | Supabase (PostgreSQL + Auth + RLS)        |
  | Auth                   | Supabase Auth + Custom HMAC tokens        |
  +------------------------+------------------------------------------+
  | Calendar               | Google Calendar API v3                    |
  | Email Sync             | Gmail API v1                              |
  | Maps                   | MapLibre GL 5.6.2                        |
  | Drive Time             | Google Maps API                           |
  +------------------------+------------------------------------------+
  | Email Sending          | Nodemailer (Gmail SMTP + OAuth2)          |
  | Push Notifications     | Pushover                                 |
  | Analytics              | PostHog (self-hosted proxy)               |
  +------------------------+------------------------------------------+
  | Content                | Contentlayer2 0.5.5 (MDX)                |
  | Search                 | Kbar (client-side)                       |
  | Theme                  | next-themes                               |
  | Toasts                 | Sonner                                    |
  +------------------------+------------------------------------------+
  | Unit Tests             | Vitest 3.2.3                              |
  | E2E Tests              | Playwright 1.56.1                         |
  | Linting                | ESLint 9.14 + Prettier 3.4.2             |
  | Spell Check            | cspell 9.2.0                              |
  | Pre-commit             | Husky + lint-staged                       |
  +------------------------+------------------------------------------+
  | Build                  | Webpack (with turbopack rules)             |
  | Bundle Analysis        | @next/bundle-analyzer                     |
  | CI/CD                  | GitHub Actions                             |
  +========================+==========================================+
```

---

## 14. Findings & Observations

### Architecture Strengths

1. **Well-structured type system** -- 13 dedicated type modules with a central
   re-export barrel (`lib/types.ts`). Types cover all domain concepts.

2. **Comprehensive test coverage** -- Unit tests (Vitest) for auth, availability
   calculation, form schemas, hash functions, email escaping. Integration tests
   for booking flow. E2E tests (Playwright) for critical paths.

3. **Security-conscious** -- Input validation (Zod) on all endpoints, HTML
   escaping in email templates, rate limiting, CSP headers, HMAC-signed tokens.

4. **Clean separation of concerns** -- Messaging templates isolated from
   business logic. Availability engine separated from calendar API calls.
   Redux slices focused on single responsibilities.

5. **Rich admin tooling** -- Mocked user flow tester, config spy, debug panels,
   Gmail sync for third-party booking extraction.

### Architecture Observations

1. **Three parallel auth systems** -- Admin auth (HMAC + localStorage), User auth
   (HMAC + localStorage), and Supabase (cookies). These appear to be in different
   stages of adoption. The HMAC-based systems may be candidates for consolidation
   into Supabase auth as the platform matures.

2. **Google OAuth secret reuse** -- `GOOGLE_OAUTH_SECRET` is used both as the
   Google OAuth client secret AND as the HMAC signing key for admin/user tokens.
   These serve different security purposes and could benefit from separate secrets.

3. **No middleware.ts** -- Auth checks are done per-route (AdminAuthWrapper layout,
   requireAdmin() in API routes) rather than via Next.js middleware. This is
   functional but means each new admin route must remember to be under the
   admin layout.

4. **Event naming convention** -- The `__EVENT__`, `__EVENT__MEMBER__`,
   `__EVENT__CONTAINER__` string-based convention in Google Calendar summaries is
   a creative solution for managing multi-booking containers within Calendar's
   constraints. It works but is fragile to summary edits.

5. **localStorage for auth state** -- Both admin and user auth use localStorage
   for session persistence. This means auth state doesn't transfer between
   devices/browsers and is vulnerable to XSS (though CSP mitigates this).
   The Supabase cookie-based auth is the more standard approach.

6. **No explicit caching layer** -- Google Calendar API calls use Next.js ISR
   (`revalidate: 1`), but there's no explicit caching strategy (Redis, etc.)
   for frequently accessed data like availability. For current traffic levels
   this is likely fine; it would become important at scale.

7. **Dev-mode exclusion pattern** -- The `dev-mode-prod-excluded` convention
   (ignored by webpack in production) is a clean way to keep testing utilities
   available in development without shipping them to production.

8. **Slug configuration system** -- Dynamic booking configurations loaded by
   URL slug provide flexible promotional routing without code changes. This is
   a well-designed extension point.

### File Counts Summary

```
  +--------------------+-------+
  | Directory          | Files |
  +--------------------+-------+
  | app/               |  ~80  |
  |   pages            |  ~45  |
  |   api routes       |   24  |
  | components/        |  ~90  |
  | lib/               | ~100  |
  |   (tests)          |  ~25  |
  | redux/             |   10  |
  | data/              |   16  |
  | layouts/           |    6  |
  | scripts/           |   16  |
  | supabase/          |    6  |
  +--------------------+-------+
  | Total (approx)     | ~350  |
  +--------------------+-------+
```

---

*Generated by architecture audit, 2026-02-09*
