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

import { SlugConfigurationType } from '../types'

type DiscountType = {
  type: 'percent' | 'dollar'
  amount: string | number
}

type SlugConfigurationObject = {
  [key: string]: SlugConfigurationType
}

const fooSlug: SlugConfigurationType = {
  bookingSlug: 'foo',
  type: 'area-wide',
  title: 'Welcome to the Foo booking page!',
  text: 'Foo paragraph text rendered by <Template />',
  location: 'foo',
}

const the_kinn: SlugConfigurationType = {
  bookingSlug: 'the_kinn',
  type: 'scheduled-site',
  title: 'Welcome to the the_kinn booking page!',
  text: 'the_kinn paragraph text rendered by <Template />',
  price: { 15: 30, 30: 60, 45: 90, 60: 120 },
  allowedDurations: [15, 30, 45, 60],
}

const fires: SlugConfigurationType = {
  bookingSlug: 'fires',
  type: 'area-wide',
  title: 'Have you been effected by the LA fires? Please use this booking link 🙏',
  text: 'My heart goes out to all those who are experiencing difficulty in this time. While I am unable to offer my massage work for free, I would like to reduce the cost for those of us who have been traumatized and are in need of care and support in this trying time.',
  price: { 60: 100 * 1, 90: 100 * 1.5, 120: 100 * 2, 150: 100 * 2.5 },
}

const closeToMe: SlugConfigurationType = {
  bookingSlug: '90045',
  type: 'area-wide',
  title: 'Do you live ridiculously close to me??',
  text: "That's so convenient! I can confidently say that IF I'M HOME and NOT BUSY I can scoot on over to you in an hour or less. See you soon!",
  leadTimeMinimum: 60,
}

export async function fetchSlugConfigurationData(): Promise<SlugConfigurationObject> {
  return { foo: fooSlug, the_kinn, fires, '90045': closeToMe }
}
