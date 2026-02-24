import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-08',
  repos: ['massage'],
  commitCount: 189,
  highlights: [
    'Built a full landing page redesign with Hero, Pricing, Services, Service Area, How It Works, and Contact sections',
    'Added admin authentication with protected routes, token generation, and an admin nav',
    'Created Pushover push notifications for new booking requests',
    'Upgraded to Tailwind v4 and Next.js 15.5',
  ],
  categories: [
    {
      label: 'Landing Page Redesign',
      icon: 'paint',
      items: [
        'Built HeroSection, PricingSection, HowItWorksSection, FeatureHighlightsSection, AboutSection, ContactSection, and ServiceAreaSection',
        'Created /services and /pricing standalone pages with shared services data',
        'Built GradientText utility component with configurable color stops and validation',
        'Recreated DynamicGridMasonry and TestimonialsCarousel for review display',
        'Added secondary color palette to Tailwind config',
        'Moved landing page content to the root route',
        'Updated Footer with additional links and layout',
      ],
    },
    {
      label: 'Admin Auth & Tools',
      icon: 'shield',
      items: [
        'Built admin authentication system with token generation, auth provider, and protected routes',
        'Created admin nav for authenticated pages',
        'Added admin event viewer, my_events page, and event sorting helpers',
        'Built mocked_user_flow page and API for end-to-end booking testing',
        'Created admin gmail integration page for Soothe event creation',
      ],
    },
    {
      label: 'Notifications',
      icon: 'bell',
      items: [
        'Added Pushover push notification support with a helper function',
        'Wired Pushover into the appointment request handler so new bookings trigger a push',
      ],
    },
    {
      label: 'Maps & Location',
      icon: 'map',
      items: [
        'Built MapTile component with geocoding and circle overlay',
        'Changed location type from a plain string to a structured {city, zip, street} object',
        'Added URL param support for updating city, zip, and location fields',
        'Created driveTime API route for travel time calculations',
        'Added geocode result caching and a static LA map generation script',
      ],
    },
    {
      label: 'Booking Flow',
      icon: 'calendar',
      items: [
        'Created the "recharge" booking slug with support for short 5/10-minute durations',
        'Added blockingScope config attribute to control how events block availability',
        'Built BookingSummary component showing booking details as the form is filled in',
        'Added discount display to BookingSummary',
        'Created free-30 slug configuration',
        'Added promo and bookingUrl to the booking flow data',
      ],
    },
    {
      label: 'Contact',
      icon: 'globe',
      items: [
        'Built ContactForm component and /contact page',
        'Created api/contact route and createContactUrl helper',
      ],
    },
    {
      label: 'Infrastructure',
      icon: 'tools',
      items: [
        'Upgraded to Tailwind v4 and Next.js 15.5',
        'Fixed PostHog analytics setup with /ingest proxy and env-based api_host',
        'Added react-icons dependency',
        'Created convert_and_resize_images script for asset optimization',
        'Split createPageConfiguration into smaller functions',
        'Added build:staged CI script',
      ],
    },
  ],
}

export default summary
