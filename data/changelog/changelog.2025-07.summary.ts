import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-07',
  repos: ['massage'],
  commitCount: 93,
  highlights: [
    'Added promotional page system with expiration dates and an admin list of active promos',
    'Migrated from yarn to pnpm and added cspell spellchecking to the CI pipeline',
    'Converted ratings data to TypeScript and built a spellcheck correction script for review text',
    'Set up PostHog client-side library with a test page to verify analytics state',
  ],
  categories: [
    {
      label: 'Promotional Pages',
      icon: 'calendar',
      items: [
        'Added promoEndDate field to slug configurations so promos can auto-expire',
        'Built ExpiredPromoPage component shown when a promo is past its end date',
        'Created normalizeYYYYMMDD helper and promo validation logic with tests',
        'Added admin page listing all active promotional routes',
      ],
    },
    {
      label: 'Reviews & Ratings',
      icon: 'paint',
      items: [
        'Converted ratings file from JS to TypeScript with a typed ReviewCard interface',
        'Built a spellcheck correction script for review text with a custom dictionary',
        'Separated ReviewCard helper functions into their own module',
        'Added new ratings data covering September 2024 through July 2025',
      ],
    },
    {
      label: 'Build & CI',
      icon: 'tools',
      items: [
        'Migrated from yarn to pnpm across the project',
        'Added cspell spellchecking to the pre-commit hook and CI pipeline',
        'Switched Prettier config from .js to .mjs',
        'Fixed a batch of typos caught by the new spellchecker',
      ],
    },
    {
      label: 'Analytics',
      icon: 'code',
      items: [
        'Created PostHog client-side library and wired it into the app',
        'Built isTestUser page and API route to verify PostHog state',
        'Upgraded posthog-js and posthog-node packages',
      ],
    },
    {
      label: 'Booking Flow',
      icon: 'bolt',
      items: [
        'Added hotelRoomNumber, parking, and notes fields to the appointment schema',
        'Made BookingForm accept an onSubmit prop for custom submission handling',
        'Fixed createPageConfiguration to only apply overrides when both config and overrides exist',
        'Refactored fetchSlugConfigurationData to accept arrays and return a map',
      ],
    },
    {
      label: 'UI',
      icon: 'paint',
      items: [
        'Built DynamicGridMasonry layout component',
        'Updated FAQCard design and FAQ language',
        'Fixed image skew for non-square images with object-cover',
      ],
    },
  ],
}

export default summary
