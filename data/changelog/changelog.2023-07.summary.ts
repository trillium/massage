import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2023-07',
  repos: ['www-massage'],
  commitCount: 12,
  highlights: [
    'Added pricing and session details to calendar events and email confirmations',
  ],
  categories: [
    {
      label: 'Booking Notifications',
      icon: 'calendar',
      items: [
        'Added price to calendar event summaries and made pricing accessible throughout the booking flow',
        'Refactored email and event templates for flexibility, including session info and a payment hint',
        'Fixed phone number field in appointment data and corrected the site title',
        'Added Vercel Analytics',
      ],
    },
  ],
}

export default summary
