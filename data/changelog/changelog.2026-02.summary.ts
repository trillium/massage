import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2026-02',
  repos: ['massage'],
  commitCount: 228,
  highlights: [
    'Built scoped event tokens so clients can view, edit, cancel, and reschedule their own bookings without logging in',
    'Added a reminders system with Supabase tables, auto-schedule triggers, channel adapters, and a processing API',
    'Replaced legacy auth entirely with Supabase OAuth, including adminFetch, my_events, and email link generation',
    'Created siteConfig.json as a single source of business values powering landing page, emails, FAQ, and domain fallbacks',
  ],
  categories: [
    {
      label: 'Client Event Pages',
      icon: 'calendar',
      items: [
        'Built token-gated client event page with status display, edit form, and cancel with type-to-confirm modal',
        'Added reschedule flow that updates event time in-place instead of cancel-and-rebook',
        'Added rebook link that pre-fills the booking form with client info from the event',
        'Replaced all my_events email links with scoped event page URLs',
        'Added 7-day grace period to event token expiry',
      ],
    },
    {
      label: 'Reminders',
      icon: 'bell',
      items: [
        'Created appointments, reminders, and reminder_logs Supabase tables with an auto-schedule trigger',
        'Built appointment record helpers and wired them into booking flows',
        'Added channel adapter system with email templates for reminder delivery',
        'Built processReminders function and API route with tests',
      ],
    },
    {
      label: 'Auth & Security',
      icon: 'shield',
      items: [
        'Migrated adminFetch from legacy tokens to Supabase session',
        'Converted my_events to an OAuth-protected server component',
        'Removed legacy AdminAuthManager and legacy secure URL generation',
        'Added server-side admin guards to previously unprotected API routes',
        'Added admin auth to gallery order, events/byEmail, and events/[event_id] endpoints',
        'Escaped user data in all email templates to prevent XSS',
        'Added environment variable validation at startup',
        'Tightened CSP -- removed dead domains and locked down connect-src',
        'Added audit logging to admin promote/demote endpoints',
        'Validated OAuth redirects are relative paths',
      ],
    },
    {
      label: 'Site Configuration',
      icon: 'bolt',
      items: [
        'Created siteConfig.json as single source of business values',
        'Derived landing page content, email templates, FAQ, and domain fallbacks from siteConfig',
        'Added configurable pricing that flows through the whole system',
        'Added 5, 10, 20, and 25-minute duration options',
      ],
    },
    {
      label: 'Reviews & Gallery',
      icon: 'images',
      items: [
        'Migrated review data from static files to Supabase',
        'Built admin review management with create, edit, and filter-by-source',
        'Split ratings.ts into platform-specific files',
        'Added Gallery component with masonry layout, lightbox, and prev/next navigation',
        'Built curated gallery with a reorder tool',
      ],
    },
    {
      label: 'Testing',
      icon: 'code',
      items: [
        'Added characterization tests for fetchPageData covering all code paths',
        'Added API tests for confirm, driveTime, create-appointment, onsite/confirm, tiles, and auth routes',
        'Added tests for request workflow, event helpers, reminder processing, and admin auth',
        'Enabled TypeScript strict mode and fixed all resulting type errors',
      ],
    },
    {
      label: 'Tooling & DX',
      icon: 'tools',
      items: [
        'Replaced Prettier and ESLint with Biome for formatting and linting',
        'Added knip for dead-code detection',
        'Added tsgo type-checking to lint-staged',
        'Pre-commit hook now creates beads tickets for large files instead of blocking',
        'Added emoji pre-commit hook replacing literal emojis with react-icons',
        'Added database backup script pushing to a private GitHub repo',
      ],
    },
    {
      label: 'Booking & Display',
      icon: 'paint',
      items: [
        'Built /display event booking page for on-location use',
        'Created /sandbox demo booking simulator with DOMPurify-sanitized email preview',
        'Added presence badge to TimeButton and showPrice prop to DurationPicker',
        'Added site navigation to kbar command palette',
        'Built platform comparison page with honest gaps section',
        'Added client slug MDX system with template variable replacement',
        'Added QR code generator script with color presets',
      ],
    },
    {
      label: 'Refactoring',
      icon: 'bolt',
      items: [
        'Extracted fetchPageData god function into named handlers',
        'Split formSlice into bookingFormSlice and reviewFormSlice',
        'Removed keystroke Redux sync, made Formik the single source of truth for form state',
        'Extracted BookingForm into hooks and field components',
        'Collapsed duplicate fetchFixedLocation/fetchAreaWide into one function',
        'Extracted shared confirm/decline and driveTime helpers into shared modules',
        'Cached OAuth access token in memory for 50 minutes',
      ],
    },
  ],
}

export default summary
