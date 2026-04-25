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

import { SlugConfigurationType, LocationObject } from '@/lib/types'
import { createLocationObject, stringToLocationObject } from './helpers/parseLocationFromSlug'
import { siteConfig } from '@/lib/siteConfig'

const contactPhone = siteConfig.contact.phone ?? ''

const free_thirty: SlugConfigurationType = {
  ...initialStateWithoutType,
  type: 'area-wide',
  title: 'On the fence? Try out 30 minutes free!',
  leadTimeMinimum: 18,
  allowedDurations: [30, 60, 90, 120],
  pricing: { 30: 70, 60: 140, 90: 210, 120: 280 },
  discount: {
    type: 'dollar',
    amountDollars: 70,
  },
  eventContainer: 'free-30',
  blockingScope: 'general',
}

const instructionalSlug: SlugConfigurationType = {
  ...initialStateWithoutType,
  type: 'area-wide',
  bookingSlug: ['instructional'],
  allowedDurations: [90],
  pricing: { 90: 210 },
  title: 'Ready to learn to give a great massage?!',
  text: [
    'In this hands-on workshop you’ll learn techniques to give a professional-level, relaxing massage while keeping your body comfortable and avoiding strain.',
    'Designed for two participants with approximately 60 minutes of hands-on instruction. Larger groups can be accommodated with advance notice.',
  ],
}

const slugConfigurations: SlugConfigurationType[] = [
  instructionalSlug,
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
    bookingSlug: ['hotel-june'],
    type: 'fixed-location',
    title: 'Book an in-room massage at Hotel June!',
    text: 'Please provide your room number.',
    location: createLocationObject('Hotel June West LA, 8639 Lincoln Blvd', 'Los Angeles', '90045'),
    locationIsReadOnly: true,
    leadTimeMinimum: 60,
    customFields: {
      showHotelField: true,
      showNotesField: true,
    },
  },
  {
    ...free_thirty,
    bookingSlug: ['playa-free-30', 'free-30', 'free-thirty'],
    locationWarning: {
      city: 'Playa Vista',
      message:
        'This free 30-minute offer is available for Playa Vista residents. Appointments outside this area might be declined.',
    },
  },
  {
    ...free_thirty,
    bookingSlug: ['playa-free-30', '90045-free-30', 'playa-del-rey-free-30'],
    locationWarning: {
      city: 'Playa Vista',
      message:
        'This free 30-minute offer is available for Playa Vista residents. Appointments outside this area might be declined.',
    },
  },
  {
    ...free_thirty,
    bookingSlug: ['90045-free-30', 'playa-del-rey-free-30'],
    locationWarning: {
      zip: '90045',
      message:
        'This free 30-minute offer is available for Playa Vista residents. Appointments outside this area might be declined.',
    },
  },
  {
    ...free_thirty,
    bookingSlug: ['playa-del-rey-free-30'],
    locationWarning: {
      city: 'Playa Del Rey',
      message:
        'This free 30-minute offer is available for Playa Del Rey residents. Appointments outside this area might be declined.',
    },
  },
  {
    ...free_thirty,
    bookingSlug: ['westchester-free-30'],
    locationWarning: {
      city: 'Westchester',
      message:
        'This free 30-minute offer is available for Westchester residents. Appointments outside this area might be declined.',
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['recharge'],
    type: 'fixed-location',
    title: 'Recharge while you charge!',
    text: 'Quick massage pick-me-up while charging ;)',
    location: stringToLocationObject('3JR8+FR West Hollywood, California, 90069'),
    eventContainer: 'recharge_chair',
    blockingScope: 'general',
    pricing: { 10: 18, 15: 25, 30: 50 },
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: true,
    allowedDurations: [10, 15, 30],
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['100Devs'],
    type: 'fixed-location',
    title: 'SCaLE 23x — Book a Session!',
    text: "Testing platform. Pick a time and we'll get you in!",
    location: createLocationObject(
      'Pasadena Convention Center, 300 E Green St',
      'Pasadena',
      '91101'
    ),
    locationIsReadOnly: true,
    eventContainer: '100Devs',
    defaultDuration: 5,
    allowedDurations: [5, 10, 15, 20, 30],
    pricing: { 5: 0, 10: 0, 15: 0, 20: 0, 30: 0 },
    pricingLabels: {
      5: 'Free!',
      10: 'Please tip for time above 5m',
      15: 'Please tip for time above 5m',
      20: 'Please tip for time above 5m',
      30: 'Please tip for time above 5m',
    },
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: false,
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['scale23x'],
    type: 'fixed-location',
    title: 'SCaLE 23x — Book a Session!',
    text: "Quick chair massage at SCaLE 23x. Pick a time and we'll get you in!",
    location: createLocationObject(
      'Pasadena Convention Center, 300 E Green St',
      'Pasadena',
      '91101'
    ),
    locationIsReadOnly: true,
    eventContainer: 'scale23x',
    defaultDuration: 5,
    allowedDurations: [5, 10, 15, 20, 30],
    pricing: { 5: 0, 10: 0, 15: 0, 20: 0, 30: 0 },
    pricingLabels: {
      5: 'Free!',
      10: 'Please tip for time above 5m',
      15: 'Please tip for time above 5m',
      20: 'Please tip for time above 5m',
      30: 'Please tip for time above 5m',
    },
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: false,
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['openclaw'],
    type: 'fixed-location',
    hideCalendar: true,
    title: 'OpenClaw Meetup — Book a Session!',
    text: "Complementary chair massage! Pick a time and we'll get you in!",
    location: createLocationObject(
      'Art and Space - Venue, 5555 Washington Blvd',
      'Los Angeles',
      '90016'
    ),
    locationIsReadOnly: true,
    eventContainer: 'openclaw',
    defaultDuration: 5,
    allowedDurations: [5, 10, 15, 20, 30],
    pricing: { 5: 0, 10: 0, 15: 0, 20: 0, 30: 0 },
    pricingLabels: {
      5: 'Free!',
      10: 'Please tip for time above 5m',
      15: 'Please tip for time above 5m',
      20: 'Please tip for time above 5m',
      30: 'Please tip for time above 5m',
    },
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: false,
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['openclaw-raffle-prize'],
    type: 'area-wide',
    defaultDuration: 60,
    title: 'OpenClaw Raffle — Your Free Session!',
    text: `Congratulations on winning the OpenClaw raffle! Book your free 60-minute in-home massage. Questions? Call or text ${contactPhone}`,
    allowedDurations: [60, 90, 120, 150],
    pricing: { 60: 0, 90: 70, 120: 140, 150: 210 },
    pricingLabels: {
      60: 'Free! ($140 value)',
      90: '$70 ($210 value — 60 min free!)',
      120: '$140 ($280 value — 60 min free!)',
      150: '$210 ($350 value — 60 min free!)',
    },
    promoEndDate: '2026-05-23',
    acceptingPayment: true,
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['scale23x-after-hours'],
    type: 'fixed-location',
    title: 'SCaLE 23x After Hours — Book a Session!',
    text: "Quick chair massage at SCaLE 23x. Pick a time and we'll get you in!",
    location: createLocationObject(
      'Pasadena Convention Center, 300 E Green St',
      'Pasadena',
      '91101'
    ),
    locationIsReadOnly: true,
    eventContainer: 'scale23x_after_hours',
    defaultDuration: 5,
    allowedDurations: [5, 10, 15, 20, 30],
    pricing: { 5: 0, 10: 0, 15: 0, 20: 0, 30: 0 },
    pricingLabels: {
      5: 'Free!',
      10: 'Please tip for time above 5m',
      15: 'Please tip for time above 5m',
      20: 'Please tip for time above 5m',
      30: 'Please tip for time above 5m',
    },
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: false,
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['nerdstage'],
    type: 'fixed-location',
    hideCalendar: true,
    title: 'Nerdstage — Book a Session!',
    text: "Quick chair massage at Nerdstage. Pick a time and we'll get you in!",
    location: createLocationObject('The Clubhouse, 1201 Olympic Blvd', 'Santa Monica', '90404'),
    locationIsReadOnly: true,
    eventContainer: 'nerdstage',
    defaultDuration: 5,
    allowedDurations: [5, 10, 15, 20, 30],
    pricing: { 5: 0, 10: 0, 15: 0, 20: 0, 30: 0 },
    pricingLabels: {
      5: 'Free!',
      10: 'Please tip for time above 5m',
      15: 'Please tip for time above 5m',
      20: 'Please tip for time above 5m',
      30: 'Please tip for time above 5m',
    },
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: false,
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['nerdstage-upgrade-2026-04'],
    type: 'area-wide',
    title: 'Nerdstage Attendees: Free 30-Minute Upgrade',
    text: [
      'Book a session and get 30 minutes added free. Offer expires May 25, 2026.',
      '- In-home: massage table or chair.',
      '- In-office: massage chair for up to 12 guests.',
    ],
    durationBonus: 30,
    pricingLabels: {
      60: '+30 min free! (90 min session)',
      90: '+30 min free! (120 min session)',
      120: '+30 min free! (150 min session)',
    },
    allowedDurations: [60, 90, 120],
    promoEndDate: '2026-05-25',
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['barter'],
    type: 'area-wide',
    title: 'Free / Barter Session',
    text: 'This session is free or covered by a barter arrangement. Pick a duration that works for you!',
    pricing: { 30: 0, 60: 0, 90: 0, 120: 0, 150: 0, 180: 0, 210: 0, 240: 0, 270: 0 },
    allowedDurations: [30, 60, 90, 120, 150, 180, 210, 240, 270],
    defaultDuration: 60,
    leadTimeMinimum: 60,
    acceptingPayment: false,
    customFields: {
      showNotesField: true,
    },
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['mr_pasadena'],
    type: 'fixed-location',
    title: 'Book a Session in Pasadena',
    location: createLocationObject('87 N Raymond Ave', 'Pasadena', '91103'),
    locationIsReadOnly: true,
    eventContainer: 'mr_pasadena',
    blockingScope: 'general',
    pricing: { 15: 35, 30: 70, 45: 105, 60: 140 },
    allowedDurations: [15, 30, 45, 60],
    leadTimeMinimum: 0,
    instantConfirm: true,
    acceptingPayment: true,
  },
  {
    ...initialStateWithoutType,
    bookingSlug: ['chat-with-me'],
    type: 'fixed-location',
    title: 'Psyche! Not a Massage, Just a Phone Call',
    text: [
      'This is actually just for scheduling a casual phone chat. No massage involved!',
      "If you'd rather not send your phone number, (no worries), just enter a bunch of 0's and put a note saying let's chat over Google.",
    ],
    eventContainer: 'chat',
    location: createLocationObject('Via Phone or Google Meet', 'Virtual', '00000'),
    locationIsReadOnly: true,
    pricing: { 30: 0, 60: 0 },
    allowedDurations: [15, 30, 45, 60],
    leadTimeMinimum: 5,
    instantConfirm: true,
    acceptingPayment: false,
    customFields: {
      showNotesField: true,
    },
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
