import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-12',
  repos: ['massage'],
  commitCount: 79,
  highlights: [
    'Migrated the entire booking app from www-massage into a new repo built on tailwind-nextjs-starter-blog',
    'Cleaned up ESLint warnings across every migrated file to match the new codebase standards',
    'Consolidated providers (Redux, PostHog, Theme) into a single provider file',
    'Adapted all async APIs for Next.js 15 (awaited searchParams, headers)',
  ],
  categories: [
    {
      label: 'Repo Migration',
      icon: 'bolt',
      items: [
        'Initialized new massage repo on tailwind-nextjs-starter-blog template',
        'Migrated all app pages, API routes, components, context, and Redux store from www-massage',
        'Moved over lib directory including availability helpers, schemas, and data fetching',
        'Ported environment config template and payment/ratings data files',
        'Renamed next.config to .mjs with ES module import syntax',
      ],
    },
    {
      label: 'Branding & Config',
      icon: 'paint',
      items: [
        'Updated siteMetadata with massage business info',
        'Configured Tailwind colors and fonts to match the massage site design',
        'Built Logo component and updated avatar image',
      ],
    },
    {
      label: 'Next.js 15 Compatibility',
      icon: 'code',
      items: [
        'Awaited searchParams across all pages for Next.js 15 async API changes',
        'Added await for headers in API route files',
        'Fixed LRUCache imports for updated dependency',
        'Fixed breaking rename in date-fns-tz',
        'Updated autocomplete attributes to standard values in BookingForm',
      ],
    },
    {
      label: 'Architecture Cleanup',
      icon: 'tools',
      items: [
        'Consolidated PostHog, Redux, and Theme providers into a single provider file',
        'Refactored schema to extend from a shared base',
        'Exported Zod-inferred types from schema for reuse',
        'Added tsconfig import paths for redux and lib directories',
        'Fixed Redux import paths to use the new alias structure',
      ],
    },
    {
      label: 'Dependencies',
      icon: 'bolt',
      items: [
        'Added react-redux, date-fns, date-fns-tz, posthog-js, posthog-node, heroicons, tailwind-merge, formik, and yup',
      ],
    },
  ],
}

export default summary
