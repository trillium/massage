import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-01',
  repos: ['massage', 'www-massage'],
  commitCount: 182,
  highlights: [
    'Replaced client-side booking logic with server-rendered slots and a Redux configSlice, removing PricingWrapper and AvailabilityPicker entirely',
    'Built the SlugConfigurationType system so booking pages are driven by named configuration objects',
    'Added Hero component with masonry layout for the landing page redesign',
    'Set up Jest testing infrastructure with fake data generators and test helpers',
  ],
  categories: [
    {
      label: 'Booking Architecture',
      icon: 'bolt',
      items: [
        'Ripped out PricingWrapper, AvailabilityPicker, and ClientPage pattern in favor of server-rendered slots passed directly from page.tsx',
        'Built three utility components (InitialUrlUtility, UpdateSlotsUtility, UrlUpdateUtility) to handle client-side state syncing',
        'Created Redux configSlice to hold booking configuration, pricing, allowed durations, and lead time',
        'Moved availability-by-date calculation from wrapper components into Calendar and TimeList directly',
        'Added createSlots function extracted from PricingWrapper for reuse across pages',
        'Integrated server-rendered slots into /book, /onsite, and test routes',
      ],
    },
    {
      label: 'Slug Configuration',
      icon: 'calendar',
      items: [
        'Created SlugConfigurationType with type, pricing, location, lead time, and allowed durations',
        'Built fetchSlugConfiguration to load config by booking slug',
        'Added named configurations for event-specific and location-based booking pages',
        'Added locationIsReadOnly and acceptingPayment flags driven by config data instead of props',
        'Created configResetSlice reducer to return booking state to initial values',
      ],
    },
    {
      label: 'Landing Page',
      icon: 'paint',
      items: [
        'Built Hero component with left/right image layout and call-to-action linking to /book',
        'Created masonry image grid component with flex column layout',
        'Added scheduler directly to the front page',
        'Added active state highlighting for the current path in header navigation',
        'Added active state styling to time selection buttons',
        'Updated favicon and social card images',
      ],
    },
    {
      label: 'Next.js 15 & Dependencies',
      icon: 'code',
      items: [
        'Resolved Promise-based searchParams across /booked, /onsite, /reviews, and booking slug pages',
        'Migrated Headless UI from deprecated APIs (Disclosure.Panel, TransitionChild, Dialog.Title, Menu, Radio)',
        'Upgraded ESLint and Prettier configs with eslint:recommended and cleaned up rule exports',
        'Switched import assertions from assert to with for Node 22 compatibility',
      ],
    },
    {
      label: 'Testing',
      icon: 'tools',
      items: [
        'Set up Jest config with environment settings and test file exclusions',
        'Created fake data generators using Faker for test fixtures',
        'Added test helpers including writeObjectToDisk and fetch-mocking utilities',
        'Organized test utilities into __helpers__ directory',
      ],
    },
    {
      label: 'Booking Flow',
      icon: 'calendar',
      items: [
        'Built /instantConfirm endpoint for instant booking confirmations',
        'Added instantConfirm and acceptingPayment fields to appointment schema',
        'Added price display to the Request Booking card',
        'Moved email recipient to siteMetadata config instead of hardcoded constant',
        'Added focus-visible outline styles for buttons and links',
      ],
    },
  ],
}

export default summary
