import { initialState } from '@/redux/slices/configSlice'
import type { SlugConfigurationType } from '@/lib/types'

const base = { ...initialState }

export const edgeSlugConfigurations: SlugConfigurationType[] = [
  {
    ...base,
    bookingSlug: ['edge-office-hours'],
    type: 'fixed-location',
    hideCalendar: true,
    nextSlotOnly: true,
    title: 'Edge — Office Hours Chair Massage',
    text: [
      'Drop-in chair or table massage — no advance booking required.',
      'Attendees: 5 min complimentary, tip for time above. Volunteers and team members: 15 min complimentary, tip for time above.',
    ],
    location: null,
    locationIsReadOnly: true,
    eventContainer: 'edge',
    blockingScope: 'general',
    defaultDuration: 15,
    allowedDurations: [15, 30, 60],
    pricing: { 15: 0, 30: 0, 60: 0 },
    pricingLabels: { 15: 'Complimentary', 30: 'Complimentary', 60: 'Complimentary' },
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: false,
    links: [{ label: 'Back to the Edge page', href: '/edge' }],
    customFields: {
      showRoleField: true,
      roleHints: {
        attendee: 'complimentary first 5 min — please tip for time above',
        volunteer: {
          15: 'complimentary',
          30: 'complimentary — please tip for time above 15 min',
          60: 'complimentary — please tip for time above 15 min',
        },
        team: {
          15: 'complimentary',
          30: 'complimentary — please tip for time above 15 min',
          60: 'complimentary — please tip for time above 15 min',
        },
      },
      showNotesField: true,
      locationFromContainer: true,
    },
  },
  {
    ...base,
    bookingSlug: ['edge-private'],
    type: 'fixed-location',
    title: 'Edge — Private Session',
    text: [
      'Table massage in a private setting (ideally your hotel/Airbnb). Book at least 2 hours in advance.',
      'Attendees: +15 min bonus on any booking. Volunteers: +30 min bonus. Team members: 60/90/120 fully complimentary.',
    ],
    eventContainer: 'edge_private',
    blockingScope: 'general',
    defaultDuration: 60,
    allowedDurations: [60, 90, 120],
    pricing: { 60: 0, 90: 0, 120: 0 },
    pricingLabels: { 60: 'Complimentary', 90: 'Complimentary', 120: 'Complimentary' },
    leadTimeMinimum: 120,
    instantConfirm: true,
    acceptingPayment: false,
    links: [{ label: 'Back to the Edge page', href: '/edge' }],
    customFields: {
      showRoleField: true,
      roleHints: {
        attendee: 'complimentary + 15 min bonus',
        volunteer: 'complimentary + 30 min bonus',
        team: 'complimentary',
      },
      roleBonus: { attendee: 15, volunteer: 30, team: 0 },
      showNotesField: true,
      showRequestSoonerField: true,
      locationFromContainer: true,
    },
  },
]
