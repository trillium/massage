/* 
This function will be replaced by a platformized API version eventually.

Current role is to return an object that has configurations for [bookingSlug] that fit
  - A single location site
    - eg book at This Hotel
  - A single location site that has specific containerized availability
    - eg book at This Office at These Times
  - A referral or discount block
    - eg Fire Relief Service
    - eg credit Influencer for these sessions
  - Can limit availability by promoEnd
*/

import { initialState } from '@/redux/slices/configSlice'
const { ...initialStateWithoutType } = initialState

import { SlugConfigurationType, LocationObject } from '../types'
import { createLocationObject } from './helpers/parseLocationFromSlug'

type DiscountType = {
  type: 'percent' | 'dollar'
  amount: string | number
}

const slugConfigurations: SlugConfigurationType[] = [
  {
    ...initialStateWithoutType,
    bookingSlug: ['foo'],
    type: 'area-wide',
    title: 'Welcome to the Foo booking page!',
    text: 'Foo paragraph text rendered by <Template />',
    location: createLocationObject('', 'Los Angeles', '90210'),
  },
  {
    ...initialStateWithoutType,
    type: 'area-wide',
    bookingSlug: ['expired'],
    promoEndDate: '2025-1-1', // Example promo end date
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['the_kinn'],
    type: 'scheduled-site',
    title: 'Welcome to the the_kinn booking page!',
    text: 'the_kinn paragraph text rendered by <Template />',
    pricing: { 15: 30, 30: 60, 45: 90, 60: 120 },
    allowedDurations: [15, 30, 45, 60],
    leadTimeMinimum: 2,
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['midnight-runners'],
    type: 'area-wide',
    title: 'Running peeps, book a session!',
    discount: {
      type: 'percent',
      amountPercent: 0.25,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['90045', 'westchester', 'playa', 'playa-vista', 'kentwood'],
    type: 'area-wide',
    title: 'Do you live ridiculously close to me??',
    text: "That's so convenient! I can confidently say that if I'm home and not busy I can scoot on over to you in an hour or less. See you soon!",
    leadTimeMinimum: 60,
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['nextdoor-westchester'],
    type: 'area-wide',
    title: 'Nextdoor Westchester Promo!',
    text: 'Special pricing for Westchester neighbors booking through Nextdoor. Enjoy 20% off your session!',
    discount: {
      type: 'percent',
      amountPercent: 0.2,
    },
    promoEndDate: '2025-7-30', // Example promo end date
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['hotel-june'],
    type: 'fixed-location',
    title: 'Book an in-room massage at Hotel June!',
    text: 'Please provide your room number.',
    location: createLocationObject('Hotel June West LA, 8639 Lincoln Blvd', 'Los Angeles', '90045'),
    locationIsReadOnly: true,
    leadTimeMinimum: 60,
  },
  {
    ...initialStateWithoutType,
    type: 'area-wide',
    bookingSlug: ['playa-free-30', 'free-30', 'free-thirty'],
    title: 'On the fence? Try out 30 minutes free!',
    leadTimeMinimum: 18,
    allowedDurations: [30, 60, 90, 120],
    pricing: { 30: 70, 60: 140, 90: 210, 120: 280 },
    discount: {
      type: 'dollar',
      amountDollars: 70,
    },
    eventContainer: 'free-30',
  },
]

export async function fetchSlugConfigurationData(): Promise<{
  [key: string]: SlugConfigurationType
}> {
  // returns a map of key: bookingSlug -> value (the object)
  return slugConfigurations.reduce<{ [key: string]: SlugConfigurationType }>((map, config) => {
    if (Array.isArray(config.bookingSlug)) {
      for (const slug of config.bookingSlug) {
        map[slug] = config
      }
    }
    return map
  }, {})
}
