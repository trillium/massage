import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2023-06',
  repos: ['www-massage'],
  commitCount: 70,
  highlights: [
    'Overhauled the booking form with pricing display, message templates, and a dedicated /book route',
    'Added dark mode support across the entire app',
    'Fixed timezone bugs that caused incorrect slot availability',
  ],
  categories: [
    {
      label: 'Booking Form',
      icon: 'calendar',
      items: [
        'Rebuilt the booking form with massage-specific fields and pricing display per duration',
        'Created a configurable pricing model tied to appointment durations',
        'Added message templates for appointment summaries and confirmations with physical location details',
        'Extracted booking logic into a BookingFeature module with a dedicated /book route',
        'Made the confirmation page configurable with custom title and text props',
        'Added configurable appointment interval setting for slot frequency',
        'Expanded availability to include weekends and set a minimum duration for appointments',
      ],
    },
    {
      label: 'Dark Mode',
      icon: 'paint',
      items: [
        'Added next-themes provider and a theme toggle component',
        'Updated Tailwind config with dark theme support',
        'Applied dark mode styles to day buttons, booking form, submit button, and duration picker',
        'Replaced accent color system with a secondary color palette',
      ],
    },
    {
      label: 'Scheduling Fixes',
      icon: 'bolt',
      items: [
        'Fixed timezone conversion so backend slots render correctly across time zones',
        'Fixed locale date formatting to use date-fns-tz for consistent display',
        'Forced UTC in date range interval calculation to prevent off-by-one day errors',
        'Fixed the first-available-slot suggestion to update correctly on mount',
        'Corrected day button disabled state logic',
      ],
    },
    {
      label: 'UI Polish',
      icon: 'paint',
      items: [
        'Equalized picker component heights for consistent layout',
        'Improved time button focus and hover styles',
        'Disabled hover effects on touch devices',
        'Improved confirmation page wording and warning messages for clarity',
      ],
    },
  ],
}

export default summary
