import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-10',
  repos: ['www-massage'],
  commitCount: 62,
  highlights: [
    'Built onsite chair massage booking flow with request form, validation schema, and email notifications',
    'Refactored BookingForm to support both regular and onsite appointment types',
    'Extracted BookedCard component and upgraded confirmation and booked pages with richer client info',
  ],
  categories: [
    {
      label: 'Onsite Booking',
      icon: 'calendar',
      items: [
        'Built /onsite page with radio and checkbox UI for chair massage block sessions',
        'Created OnSiteRequestSchema and ChairAppointmentBlock types for onsite bookings',
        'Added createOnsiteAppointment function and onsite container booking endpoints',
        'Created onsite email templates for chair massage request notifications',
        'Added phone number to the initial booking request email',
      ],
    },
    {
      label: 'Booking Form & Flow',
      icon: 'paint',
      items: [
        'Refactored BookingForm to accept booking type as a flexible child component via AppointmentProps',
        'Extracted BookedCard component and reused it across /booked and /confirmation pages',
        'Passed richer client and appointment data through to booked and confirmation pages',
        'Changed terminology from "meeting" to "appointment" throughout the app',
      ],
    },
    {
      label: 'Data & Container System',
      icon: 'bolt',
      items: [
        'Created underscore helper functions for data loading and YAML parsing',
        'Added pricing, lead time, and acceptingPayment props to the container system',
        'Wired event description data into the booking slug client page',
        'Fixed object spread order in fetchContainersByQuery to preserve start and end times',
      ],
    },
    {
      label: 'Code Quality',
      icon: 'code',
      items: [
        'Added unit tests for data loading helpers',
        'Exported handleSubmit for testability',
        'Cleaned up unused imports, props, and debug code across onsite and confirmation pages',
      ],
    },
  ],
}

export default summary
