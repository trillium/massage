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

import { AllowedDurationsType, PricingType } from '../types'

type DiscountType = {
  type: 'percent' | 'dollar'
  amount: string | number
}

type SlugConfigurationType = {
  bookingSlug: string // this must be unique and cannot conflict with current app pages
  title?: string
  text?: string
  location?: string
  editLocation?: boolean
  eventContainer?: string
  price?: PricingType
  discount?: DiscountType
  leadTimeMinimum?: number // in minutes
  instantConfirm?: boolean
  acceptingPayment?: boolean
  allowedDurations?: AllowedDurationsType
}

type SlugConfigurationObject = {
  [key: string]: SlugConfigurationType
}

const fooSlug: SlugConfigurationType = {
  bookingSlug: 'foo',
  title: 'Welcome to the Foo booking page!',
  text: 'Foo paragraph text rendered by <Template />',
  location: 'foo',
}

const the_kinn: SlugConfigurationType = {
  bookingSlug: 'the_kinn',
  title: 'Welcome to the the_kinn booking page!',
  text: 'the_kinn paragraph text rendered by <Template />',
  price: { 15: 30, 30: 60, 45: 90, 60: 120 },
  allowedDurations: [15, 30, 45, 60],
}

export async function fetchSlugConfigurationData(): Promise<SlugConfigurationObject> {
  return { foo: fooSlug, the_kinn }
}
