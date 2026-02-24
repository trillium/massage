import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-09',
  repos: ['www-massage'],
  commitCount: 156,
  highlights: [
    'Built an event-container system that drives booking pages from calendar events instead of static config',
    'Created an onsite booking page with configurable durations for chair massage at events',
    'Added an admin panel with a URIMaker tool for generating review links from past appointments',
    'Built hash/encode/decode server functions with tests for secure review URLs',
  ],
  categories: [
    {
      label: 'Event Containers',
      icon: 'calendar',
      items: [
        'Replaced static booking slug config with calendar-event-driven containers that define location, pricing, and allowed durations',
        'Added fetchContainersByQuery to look up event containers by calendar search with start/end/query params',
        'Parsed JSON from calendar event descriptions to extract per-event configuration',
        'Locked location field in BookingForm when an event container provides a venue',
        'Wired container data through DurationPicker, PricingWrapper, and the booking slug page',
        'Set default duration to the middle of available options when containers provide a list',
      ],
    },
    {
      label: 'Onsite Booking',
      icon: 'map',
      items: [
        'Created /onsite page scaffolding with its own ClientPage and allowed durations config',
        'Added configurable duration list with checkbox selection and path string display',
        'Extended valid durations to support shorter chair massage blocks',
      ],
    },
    {
      label: 'Admin & Reviews',
      icon: 'tools',
      items: [
        'Built /admin page that queries calendar events and passes them to a URIMaker component',
        'Created URIMaker to generate encoded review URLs from calendar event data with scroll-to-form behavior',
        'Made session type uneditable on the review form and cleaned up the review submission email',
        'Built encode/decode server functions with key-based return format and mocked/unmocked tests',
      ],
    },
    {
      label: 'Booking UX',
      icon: 'paint',
      items: [
        'Added skeleton loading components for Calendar and TimeList',
        'Updated confirmation page to display appointment data with a call-to-action button',
        'Closed the booking modal automatically on successful submission',
        'Added timezone abbreviations to time buttons',
        'Added duration fallback when URL search params fail to parse',
      ],
    },
    {
      label: 'Infrastructure',
      icon: 'bolt',
      items: [
        'Upgraded Next.js to patch a security vulnerability',
        'Moved payment methods config to /data and extracted shared types to lib/types',
        'Improved getPotentialTimes testability by making the interval injectable',
        'Created a YAML-based data loading utility with js-yaml',
        'Renamed createAppointment to createCalendarAppointment and added event string metadata to calendar entries',
      ],
    },
  ],
}

export default summary
