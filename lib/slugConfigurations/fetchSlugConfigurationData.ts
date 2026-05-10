import { initialState } from '@/redux/slices/configSlice'
const { ...initialStateWithoutType } = initialState

import { SlugConfigurationType } from '@/lib/types'
import { createLocationObject } from './helpers/parseLocationFromSlug'
import { siteConfig } from '@/lib/siteConfig'

const contactPhone = siteConfig.contact.phone ?? ''

const slugConfigurations: SlugConfigurationType[] = [
  {
    ...initialStateWithoutType,
    bookingSlug: ['your-slug'],
    type: 'area-wide',
    title: 'Welcome! Book a session.',
    text: 'Use this page to book a session. Pick a time that works for you.',
    leadTimeMinimum: 60,
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['your-venue-slug'],
    type: 'fixed-location',
    title: 'Book a session at Your Venue',
    text: 'Please provide your room or table number.',
    location: createLocationObject('123 Main St', 'Your City', '00000'),
    locationIsReadOnly: true,
    leadTimeMinimum: 60,
    customFields: {
      showHotelField: true,
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['your-scheduled-site-slug'],
    type: 'scheduled-site',
    title: 'Welcome to the scheduled site booking page!',
    text: 'Pick a time from the available slots.',
    pricing: { 30: 60, 60: 120, 90: 180 },
    allowedDurations: [30, 60, 90],
    leadTimeMinimum: 2,
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['your-promo-slug'],
    type: 'area-wide',
    title: 'Special Offer: Free 30-Minute Upgrade',
    text: [
      'Book a session and get 30 minutes added free.',
      `Questions? Call or text ${contactPhone}`,
    ],
    durationBonus: 30,
    pricingLabels: {
      60: '+30 min free! (90 min session)',
      90: '+30 min free! (120 min session)',
    },
    allowedDurations: [60, 90],
    customFields: {
      showNotesField: true,
    },
  },
]

export async function fetchSlugConfigurationData(): Promise<{
  [key: string]: SlugConfigurationType
}> {
  return slugConfigurations.reduce<{ [key: string]: SlugConfigurationType }>((map, config) => {
    if (Array.isArray(config.bookingSlug)) {
      for (const slug of config.bookingSlug) {
        map[slug] = config
      }
    }
    return map
  }, {})
}
