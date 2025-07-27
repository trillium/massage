/* 
This function will be replaced by a platformized API version eventaully.

Current role is to return an object that has configurations for [bookingSlug] that fit
  - A single location site
    - eg book at This Hotel
  - A single location site that has specific containerized availability
    - eg book at This Office at These Times
  - A referral or discount block
    - eg Fire Relief Service
    - eg credit Influencer for these sessions
*/

import { initialState } from '@/redux/slices/configSlice'

import { SlugConfigurationType } from '../types'

type DiscountType = {
  type: 'percent' | 'dollar'
  amount: string | number
}

type SlugConfigurationObject = {
  [key: string]: SlugConfigurationType
}

const fooSlug: SlugConfigurationType = {
  ...initialState,
  bookingSlug: 'foo',
  type: 'area-wide',
  title: 'Welcome to the Foo booking page!',
  text: 'Foo paragraph text rendered by <Template />',
  location: 'foo',
}

const the_kinn: SlugConfigurationType = {
  ...initialState,
  bookingSlug: 'the_kinn',
  type: 'scheduled-site',
  title: 'Welcome to the the_kinn booking page!',
  text: 'the_kinn paragraph text rendered by <Template />',
  price: { 15: 30, 30: 60, 45: 90, 60: 120 },
  allowedDurations: [15, 30, 45, 60],
  leadTimeMinimum: 2,
}

const midnightRunners: SlugConfigurationType = {
  ...initialState,
  bookingSlug: 'midnight-runners',
  type: 'area-wide',
  title: 'Running peeps, book a session!',
  discount: {
    type: 'percent',
    amountPercent: 0.25,
  },
}

const closeToMe: SlugConfigurationType = {
  ...initialState,
  bookingSlug: '90045',
  type: 'area-wide',
  title: 'Do you live ridiculously close to me??',
  text: "That's so convenient! I can confidently say that if I'm home and not busy I can scoot on over to you in an hour or less. See you soon!",
  leadTimeMinimum: 60,
}

const hotelJune: SlugConfigurationType = {
  ...initialState,
  bookingSlug: 'hotelJune',
  type: 'fixed-location',
  title: 'Book an in-room massage at Hotel June!',
  text: 'Please provide your room number.',
  location: 'Hotel June West LA, 8639 Lincoln Blvd, Los Angeles, CA 90045',
  locationIsReadOnly: true,
  leadTimeMinimum: 60,
}

export async function fetchSlugConfigurationData(): Promise<SlugConfigurationObject> {
  return {
    foo: fooSlug,
    the_kinn,
    '90045': closeToMe,
    westchester: closeToMe,
    'playa-vista': closeToMe,
    'culver-city': closeToMe,
    'midnight-runners': midnightRunners,
    'hotel-june': hotelJune,
  }
}
