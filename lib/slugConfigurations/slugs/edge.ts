import { initialState } from '@/redux/slices/configSlice'
import { siteConfig } from '@/lib/siteConfig'
import type { SlugConfigurationType } from '@/lib/types'

const base = { ...initialState }

const HOURLY_RATE = siteConfig.pricing.baseHourlyRate

function prorate(minutes: number): number {
  return Math.round((HOURLY_RATE * minutes) / 60 / 5) * 5
}

/**
 * 15 minute session, 5m complimentray, 10m $25
 * @param freeMinutes
 * @param durations
 * @returns
 */
function tipHints(freeMinutes: number, durations: number[]): Record<number, string> {
  return Object.fromEntries(
    durations.map((d) => {
      if (d <= freeMinutes) return [d, 'complimentary']
      const above = d - freeMinutes
      return [d, `${freeMinutes}m complimentary +$${prorate(above)}`]
    })
  )
}

const edgeBase = {
  ...base,
  type: 'fixed-location' as const,
  blockingScope: 'general' as const,
  instantConfirm: true,
  acceptingPayment: false,
}

const edgeOfficeBase = {
  ...edgeBase,
  hideCalendar: true,
  hideLocation: true,
  nextSlotOnly: true,
  location: null,
  locationIsReadOnly: true,
  eventContainer: 'edge',
  defaultDuration: 15,
  allowedDurations: [5, 10, 15, 20, 30],
  pricing: { 5: 0, 10: 0, 15: 0, 20: 0, 30: 0 },
  pricingLabels: {
    5: 'Complimentary',
    10: 'Complimentary',
    15: 'Complimentary',
    20: 'Complimentary',
    30: 'Complimentary',
  },
  leadTimeMinimum: 0,
}

const edgePrivateBase = {
  ...edgeBase,
  eventContainer: 'edge_private',
  defaultDuration: 60,
  allowedDurations: [60, 90, 120],
  pricing: { 60: 0, 90: 0, 120: 0 },
  pricingLabels: { 60: 'Complimentary', 90: 'Complimentary', 120: 'Complimentary' },
  leadTimeMinimum: 120,
}

const publicLinks = [{ label: 'Back to the Edge page', href: '/edge' }]
const teamLinks = [{ label: 'Back to the Edge team page', href: '/edge-team' }]

export const edgeSlugConfigurations: SlugConfigurationType[] = [
  {
    ...edgeOfficeBase,
    bookingSlug: ['edge-office', 'edge-office-hours'],
    title: 'Edge — Office Hours Chair Massage',
    text: [
      'Drop-in chair or table massage — no advance booking required.',
      'Attendees: 5 min complimentary, tip for time above. Volunteers: 15 min complimentary, tip for time above.',
    ],
    links: publicLinks,
    customFields: {
      showRoleField: true,
      roleHints: {
        attendee: tipHints(5, edgeOfficeBase.allowedDurations),
        volunteer: tipHints(15, edgeOfficeBase.allowedDurations),
      },
      showNotesField: true,
      locationFromContainer: true,
    },
  },
  {
    ...edgePrivateBase,
    bookingSlug: ['edge-private'],
    title: 'Edge — Private Session',
    text: [
      'Table massage in a private setting (ideally your hotel/Airbnb). Book at least 2 hours in advance.',
      'Attendees: +15 min bonus on any booking. Volunteers: +30 min bonus on any booking.',
    ],
    links: publicLinks,
    customFields: {
      showRoleField: true,
      roleHints: {
        attendee: 'complimentary + 15 min bonus',
        volunteer: 'complimentary + 30 min bonus',
      },
      roleBonus: { attendee: 15, volunteer: 30 },
      showNotesField: true,
      showRequestSoonerField: true,
      locationFromContainer: true,
    },
  },
  {
    ...edgeOfficeBase,
    bookingSlug: ['edge-team-office'],
    defaultDuration: 30,
    title: 'Edge Team — Office Hours Chair Massage',
    text: [
      'Drop-in chair or table massage for Edge team members.',
      'All durations fully complimentary.',
    ],
    links: teamLinks,
    customFields: {
      forceRole: 'team',
      showNotesField: true,
      locationFromContainer: true,
    },
  },
  {
    ...edgePrivateBase,
    bookingSlug: ['edge-team-private'],
    defaultDuration: 90,
    title: 'Edge Team — Private Session',
    text: [
      'Table massage in a private setting (ideally your hotel/Airbnb). Book at least 2 hours in advance.',
      '60/90/120 minute sessions fully complimentary for Edge team.',
    ],
    links: teamLinks,
    customFields: {
      forceRole: 'team',
      showNotesField: true,
      showRequestSoonerField: true,
      locationFromContainer: true,
    },
  },
]
