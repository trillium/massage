import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-02',
  repos: ['massage'],
  commitCount: 44,
  highlights: [
    'Built createPageConfiguration utility so booking pages share a single setup pattern instead of duplicating config logic',
    'Extracted validateSearchParams to clean up page-level param handling across all booking routes',
    'Added Hotel June as a new booking slug with full configuration support',
  ],
  categories: [
    {
      label: 'Page Configuration',
      icon: 'bolt',
      items: [
        'Created createPageConfiguration utility to unify how booking pages build their config, pricing, and slot data',
        'Added overrides partial so individual pages can customize durations and other settings without forking the utility',
        'Moved DurationPicker, Calendar, and TimeList to server-rendered page in /onsite instead of client components',
        'Exported configuration in DurationProps for use with createPageConfiguration',
      ],
    },
    {
      label: 'Slug System',
      icon: 'calendar',
      items: [
        'Added Hotel June slug configuration',
        'Made slug configuration properties nullable with explicit defaults instead of optional',
        'Added NotFound response when a booking slug is not in the recognized list',
        'Spread config initialState into slug objects to reduce repetition',
      ],
    },
    {
      label: 'Booking Flow',
      icon: 'paint',
      items: [
        'Built GeneratePriceAtom component to display computed prices inline',
        'Created discountMaths helper and wired it into BookingForm',
        'Fixed discount field naming (amount to amountDollars) in midnightRunners config',
        'Fixed DurationPicker rounding classes to use correct durations array',
      ],
    },
    {
      label: 'Cleanup',
      icon: 'tools',
      items: [
        'Extracted validateSearchParams function and adopted it across all booking page routes',
        'Created GoogleCalendarFetchDataReturnType and applied it to calendar fetch functions',
        'Moved BookingFormData type from BookingForm component into shared types',
      ],
    },
  ],
}

export default summary
