import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2023-05',
  repos: ['www-massage'],
  commitCount: 6,
  highlights: [
    "Found Tim Feeley's open-source Calendly alternative (timfee/meet) and began forking it into a massage booking platform",
    'Added configurable lead time and availability hours for appointment scheduling',
  ],
  categories: [
    {
      label: 'Booking Foundation',
      icon: 'calendar',
      items: [
        "Started from Tim Feeley's timfee/meet — a serverless scheduling tool built on Google Calendar's FreeBusy API",
        'Replaced hardcoded calendar invite text with a configurable env variable',
        'Added a lead time setting so bookings require advance notice before the next available slot',
        'Configured potential open hours for appointment availability',
        'Fixed date handling in tests and corrected a type name typo',
      ],
    },
  ],
}

export default summary
