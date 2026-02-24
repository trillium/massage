import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-09',
  repos: ['massage'],
  commitCount: 180,
  highlights: [
    'Built user authentication with HMAC tokens so clients can view their own events at /my_events',
    'Added instant-confirm booking flow with automatic calendar creation, confirmation email, and push notification',
    'Refactored location from a single string into a structured locationObject/locationString pair across all routes',
    'Centralized all type definitions into organized modules with absolute @/ imports throughout the codebase',
  ],
  categories: [
    {
      label: 'Authentication',
      icon: 'shield',
      items: [
        'Built user auth system with HMAC-SHA256 tokens for /my_events access',
        'Upgraded admin auth to HMAC-SHA256 with 15-day token expiration',
        'Added PostHog user identification after email verification',
        'Integrated Redux for admin auth state management',
        'Built AdminDebugPanel and AdminConfigurationSpy for troubleshooting',
        'Added localStorage availability checks to auth methods',
      ],
    },
    {
      label: 'Instant Confirm',
      icon: 'calendar',
      items: [
        'Built end-to-end instant-confirm flow: calendar event creation, confirmation email, and push notification',
        'Added separate confirmation email template for instant bookings',
        'Included slug configuration details in admin notifications and calendar events',
        'Added custom booking fields display on the instant confirm page',
      ],
    },
    {
      label: 'Location Refactor',
      icon: 'bolt',
      items: [
        'Split location into locationObject (structured) and locationString (display) across schemas, APIs, emails, and push messages',
        'Updated confirm routes to parse locationString into locationObject',
        'Updated form submission, appointment handler, and admin UI to use the new fields',
      ],
    },
    {
      label: 'Code Organization',
      icon: 'tools',
      items: [
        'Created organized type modules and centralized all imports through @/lib/types',
        'Migrated all imports to use absolute @/ paths across lib, components, scripts, and redux',
        'Reorganized email templates and utilities into structured directories',
        'Extracted booking form schema, URL helpers, and booking slug helpers into shared modules',
        'Migrated linting from next lint to eslint CLI',
      ],
    },
    {
      label: 'Notifications',
      icon: 'bell',
      items: [
        'Added dedicated pushover message templates for appointments and contacts',
        'Added approve URL to appointment push notifications',
        'Added pushover test script for verifying notification delivery',
      ],
    },
    {
      label: 'UI & Booking',
      icon: 'paint',
      items: [
        'Added toast notifications with sonner library',
        'Made Calendar weeks-displayed count configurable, defaulting to 3',
        'Added modal busy state on form submit',
        'Added duration display to BookedCard confirmation',
        'Expanded AdminNav to full-width responsive grid layout',
        'Added HSL fallbacks for oklch colors',
      ],
    },
    {
      label: 'Dependencies',
      icon: 'code',
      items: [
        'Bumped Next.js to 15.5.4, React to 19.1.1, Zod to 4.x',
        'Updated Headless UI to 2.2.9 for React 19 compatibility',
        'Updated Tailwind CSS and PostCSS to 4.1.13',
        'Batch-updated dev dependencies (ESLint, TypeScript, cspell, lint-staged, msw, tsx)',
      ],
    },
  ],
}

export default summary
