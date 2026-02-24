import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-11',
  repos: ['massage'],
  commitCount: 52,
  highlights: [
    'Replaced the custom AdminAuthManager with Supabase auth and Google OAuth for admin access',
    'Built an MCP server with email search, calendar event listing, and calendar event creation tools',
    'Added Playwright E2E test suites for admin route protection and authentication flows',
  ],
  categories: [
    {
      label: 'Auth Migration',
      icon: 'shield',
      items: [
        'Replaced AdminAuthManager with Supabase-based admin auth',
        'Added Google OAuth login support via Supabase',
        'Built login page with dark mode, error display, and OAuth error surfacing',
        'Added admin chip display on all pages using Supabase session',
        'Renamed login route to remove Supabase branding',
        'Added profile insertion fix and admin setup script',
        'Added RLS migration for database security',
      ],
    },
    {
      label: 'MCP Server',
      icon: 'tools',
      items: [
        'Created MCP server with email search and calendar event listing tools',
        'Added calendar event creation tool with calendarId support',
        'Excluded mcp-server from production build',
      ],
    },
    {
      label: 'E2E Testing',
      icon: 'code',
      items: [
        'Added Playwright tests for admin route protection',
        'Built authentication E2E test suite',
        'Added test login page excluded from production builds',
        'Created utility script to verify test user roles in the database',
        'Added dev:e2e command for running E2E tests',
      ],
    },
    {
      label: 'Content & Reviews',
      icon: 'paint',
      items: [
        'Added October 2025 Airbnb reviews with platform source icons and links',
        'Published Airbnb services announcement blog post',
        'Added Airbnb promo blog post with booking link',
        'Added blog link to footer quick links',
      ],
    },
    {
      label: 'Booking',
      icon: 'calendar',
      items: [
        'Added client-side ZIP code validation and input restrictions',
        'Built merge-adjacent-booking feature for availability',
        'Added mock data support for calendar testing',
      ],
    },
    {
      label: 'Infrastructure',
      icon: 'bolt',
      items: [
        'Migrated middleware to proxy.ts for Next.js 16 compatibility',
        'Upgraded Next.js to 16.0.3',
        'Added pre-commit hook enforcing 250-line file limit',
        'Added pre-push hook to validate builds',
        'Replaced any types with proper TypeScript types across the codebase',
      ],
    },
  ],
}

export default summary
