import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-08',
  repos: ['www-massage'],
  commitCount: 140,
  highlights: [
    'Built a reviews system with star ratings, score display, and a submission form that emails new reviews',
    'Added PostHog analytics with referral tracking across all pages',
    'Migrated state management from React Context to Redux',
    'Split the single name field into first name and last name throughout the booking flow',
  ],
  categories: [
    {
      label: 'Reviews',
      icon: 'paint',
      items: [
        'Created a /reviews page with ReviewCard component showing ratings, scores, and review text',
        'Built a Star component with partial-fill support and configurable colors',
        'Added a ScoreDisplay component (originally SecondaryScore) with dark mode support',
        'Created a review submission form at /reviews/rate with star rating input and text fields',
        'Added a /rate/submitted confirmation page',
        'Built a ReviewSubmissionEmail template and /api/review/create route to handle submissions',
        'Added a "helpful" flag to surface select reviews on the card',
      ],
    },
    {
      label: 'Analytics & Tracking',
      icon: 'bolt',
      items: [
        'Integrated PostHog with proxy rewrites in next.config.js and an AnalyticsContext provider',
        'Built a referral tracking system with applyReferral function across all pages',
        'Added an environment variable to disable PostHog in development',
      ],
    },
    {
      label: 'State & Data',
      icon: 'code',
      items: [
        'Migrated from AvailabilityContext to Redux for form and booking state management',
        'Split the single name field into firstName/lastName across forms, API routes, schemas, and email templates',
        'Added Zod enum validation for payment method in the appointment request schema',
        'Created appointment request schema tests and configured Jest to resolve @ imports',
        'Switched time button values to ISO format',
      ],
    },
    {
      label: 'UI Polish',
      icon: 'paint',
      items: [
        'Added active-state styling to nav links',
        'Fixed hydration error in the Logo component by correcting clipPath prop casing',
        'Fixed the calendar to always display exactly three weeks',
        'Added social icons (email, Instagram) to the AboutCard',
        'Reduced nav spacing for smaller screens and normalized border classes across form inputs',
        'Renamed the "Book" nav link to "Schedule"',
        'Lightened favicon petal colors',
      ],
    },
    {
      label: 'Infrastructure',
      icon: 'tools',
      items: [
        'Upgraded Next.js to 14.2.5',
        'Added deep-linking support to FAQ items',
        'Set body to minimum screen height for consistent layout',
        'Removed lift-up animation from day and time buttons',
      ],
    },
  ],
}

export default summary
