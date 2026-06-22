import { initialState } from '@/redux/slices/configSlice'
import { siteConfig } from '@/lib/siteConfig'
import type { SlugConfigurationType } from '@/lib/types'

const base = { ...initialState }

const EDGE_CALENDAR_WEEKS = 1

const HOURLY_RATE = siteConfig.pricing.baseHourlyRate

function prorate(minutes: number): number {
  return Math.round((HOURLY_RATE * minutes) / 60 / 5) * 5
}

function tipHints(freeMinutes: number, durations: number[]): Record<number, string> {
  return Object.fromEntries(
    durations.map((d) => {
      if (d <= freeMinutes) return [d, 'complimentary']
      const above = d - freeMinutes
      return [d, `${freeMinutes}m complimentary +$${prorate(above)}`]
    })
  )
}

export type EdgeScope = 'office' | 'destination'
export type EdgePublicRole = 'attendee' | 'volunteer'

export const EDGE_MIN: Record<EdgeScope, Record<EdgePublicRole, number>> = {
  office: { attendee: 10, volunteer: 15 },
  destination: { attendee: 15, volunteer: 30 },
}

export function edgeMin(scope: EdgeScope, role: EdgePublicRole): number {
  return EDGE_MIN[scope][role]
}

export const EDGE_BLOCKING_CONTAINERS = ['edge_office', 'edge_destination'] as const

const edgeBase = {
  ...base,
  type: 'fixed-location' as const,
  blockingScope: 'containers' as const,
  blockingContainers: [...EDGE_BLOCKING_CONTAINERS],
  instantConfirm: true,
  acceptingPayment: false,
  calendarWeeks: EDGE_CALENDAR_WEEKS,
}

const edgeContactFields = { allowTelegramContact: true } as const

const edgeOfficeBase = {
  ...edgeBase,
  hideLocation: true,
  showNextSlotCard: true,
  location: null,
  locationIsReadOnly: true,
  eventContainer: 'edge_office',
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
  heroImage: {
    src: '/static/images/edge/edge-office.png',
    alt: 'Edge office hours chair massage',
  },
}

const edgeDestinationBase = {
  ...edgeBase,
  eventContainer: 'edge_destination',
  defaultDuration: 60,
  allowedDurations: [60, 90, 120],
  pricing: { 60: 0, 90: 0, 120: 0 },
  pricingLabels: { 60: 'Complimentary', 90: 'Complimentary', 120: 'Complimentary' },
  leadTimeMinimum: 120,
  heroImage: {
    src: '/static/images/edge/edge-destination.png',
    alt: 'Massage table on a winding road with a Shoulder Work Ahead sign',
  },
}

const publicLinks = [{ label: 'Back to the Edge page', href: '/edge' }]
const teamLinks = [{ label: 'Back to the Edge team page', href: '/edge-team' }]

export const edgeSlugConfigurations: SlugConfigurationType[] = [
  {
    ...edgeOfficeBase,
    bookingSlug: ['edge-office', 'edge-office-hours'],
    title: 'Edge Esmeralda — Office Hours Chair Massage',
    text: ['Drop-in chair or table massage — no advance booking required.'],
    links: publicLinks,
    customFields: {
      showRoleField: true,
      roleHints: {
        attendee: tipHints(edgeMin('office', 'attendee'), edgeOfficeBase.allowedDurations),
        volunteer: tipHints(edgeMin('office', 'volunteer'), edgeOfficeBase.allowedDurations),
      },
      showNotesField: true,
      locationFromContainer: true,
      ...edgeContactFields,
    },
  },
  {
    ...edgeDestinationBase,
    bookingSlug: ['edge-destination'],
    title: 'Edge Esmeralda — Destination Session',
    text: [
      'Table massage at a destination of your choosing (ideally your hotel/Airbnb). Book at least 2 hours in advance.',
    ],
    links: publicLinks,
    customFields: {
      showRoleField: true,
      roleHints: {
        attendee: `complimentary + ${edgeMin('destination', 'attendee')} min bonus`,
        volunteer: `complimentary + ${edgeMin('destination', 'volunteer')} min bonus`,
      },
      roleBonus: EDGE_MIN.destination,
      showNotesField: true,
      showRequestSoonerField: true,
      locationFromContainer: true,
      ...edgeContactFields,
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
      ...edgeContactFields,
    },
  },
  {
    ...edgeDestinationBase,
    bookingSlug: ['edge-team-destination'],
    defaultDuration: 90,
    title: 'Edge Team — Destination Session',
    text: [
      'Table massage at a destination of your choosing (ideally your hotel/Airbnb). Please book at least 2 hours in advance.',
      '60/90/120 minute sessions, complimentary for Edge team.',
    ],
    links: teamLinks,
    customFields: {
      forceRole: 'team',
      showNotesField: true,
      showRequestSoonerField: true,
      locationFromContainer: true,
      ...edgeContactFields,
    },
  },
]
