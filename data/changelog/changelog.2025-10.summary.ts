import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-10',
  repos: ['massage'],
  commitCount: 75,
  highlights: [
    'Built DriveTimeCalculator showing a map and travel estimate based on the client\'s device location',
    'Upgraded to Next.js 16 and React 19.2',
    'Added environment-based PostHog key selection and user identification on form submissions',
  ],
  categories: [
    {
      label: 'Drive Time & Maps',
      icon: 'map',
      items: [
        'Built DriveTimeCalculator with device geolocation and stale-state handling',
        'Created CachedTileMap component with an OSM tile caching API endpoint',
        'Added event geocoding to fetchPageData so booking pages know the event coordinates',
        'Added userCoordinates parameter to the driveTime API',
        'Updated NextBookingFeature with map display, drive time, and an enhanced header showing location and time',
        'Extracted tile calculation and rendering into sub-components',
      ],
    },
    {
      label: 'Analytics',
      icon: 'bolt',
      items: [
        'Added environment-based PostHog key selection (dev vs prod)',
        'Added user identification on form submissions and email verification',
        'Improved admin and test user identification properties',
        'Moved test user management page from /admin to a broader-access path',
      ],
    },
    {
      label: 'Booking & Promos',
      icon: 'calendar',
      items: [
        'Created Spooktober / Nextdoor promo configuration',
        'Added massage-instructional service type',
        'Added timeslotsSpecial utility for conditional slot styling',
        'Redirected users without confirmation info away from the confirm page',
        'Updated expired-promo page styling and language',
      ],
    },
    {
      label: 'Admin',
      icon: 'tools',
      items: [
        'Added ManualEntry template and multi-platform appointment support',
        'Added payout, tip, and total display in Soothe event titles',
        'Added admin-only JSON download for events',
        'Added startTime/endTime query params to admin event viewer',
        'Detected in-progress events in getNextUpcomingEvent',
      ],
    },
    {
      label: 'Infrastructure',
      icon: 'globe',
      items: [
        'Upgraded to Next.js 16 and React 19.2',
        'Tried Turbopack, fell back to webpack for Contentlayer compatibility',
        'Migrated form validation from Yup to Zod and removed Yup dependency',
        'Added Playwright E2E test configuration',
        'Consolidated duplicate availability types and extracted shared helpers',
        'Created CLAUDE.md with project guidelines',
      ],
    },
  ],
}

export default summary
