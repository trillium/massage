import { DEFAULT_PRICING } from 'config'

export const directPrices = {
  60: DEFAULT_PRICING[60], // $140
  90: DEFAULT_PRICING[90], // $210
  120: DEFAULT_PRICING[120], // $280
  150: DEFAULT_PRICING[150], // $350
}

export const airbnbPrices = {
  60: 160,
  90: 240,
  120: 320,
  150: 400,
}

export const servicesWebsite = [
  { duration: 60, name: '60-Minute Massage' },
  { duration: 90, name: '90-Minute Massage' },
  { duration: 120, name: '120-Minute Massage' },
  { duration: 150, name: 'Massage Therapy Instructional (2hr)' },
]

export const servicesAirbnb = [
  {
    name: '60m Massage',
    price: 150,
    priceDisplay: '$150, per guest',
    duration: 60,
    description:
      'Enjoy a full hour of massage wherever you are without the hassle of traffic, bringing the benefits of Swedish, Deep Tissue, or Sports massage directly to your home, office, or event. Multiple sessions to be done back-to-back.',
  },
  {
    name: '90m Massage',
    price: 225,
    priceDisplay: '$225, per guest',
    duration: 90,
    description:
      'Enjoy a full 90 minutes of massage wherever you are without the hassle of traffic, bringing the benefits of Swedish, Deep Tissue, or Sports massage directly to your home, office, or event. With a longer session, you get more time in pure massage bliss. Multiple sessions to be done back-to-back.',
  },
  {
    name: '120m Massage',
    price: 300,
    priceDisplay: '$300, per guest',
    duration: 120,
    description:
      'Enjoy a full 120 minutes of massage wherever you are without the hassle of traffic, bringing the benefits of Swedish, Deep Tissue, or Sports massage directly to your home, office, or event. With a longer session, there’s more time to focus on your specific needs, helping you feel lighter, looser, and more relaxed. Multiple sessions to be done back-to-back.',
  },
  {
    name: 'Massage Therapy Instructional',
    price: 300,
    priceDisplay: '$300, per group',
    duration: 120,
    description:
      'Want to learn to give a professional-level massage? Structured for two, you’ll receive hands-on guidance on how to give a great massage while keeping your body comfortable and avoiding strain.',
  },
  {
    name: 'Thank you Offering',
    price: 400,
    priceDisplay: '$400, per group',
    duration: 150,
    description:
      "Book 2.5 hours of massage therapy, either chair or table, at your leisure! Session can be split up between as many people as you'd like!",
  },
]

export const coupons = [
  {
    type: 'Percentage',
    discount: '10% off',
    calc: (price: number) => price * 0.9,
  },
  {
    type: 'Percentage',
    discount: '15% off',
    calc: (price: number) => price * 0.85,
  },
  {
    type: 'Percentage',
    discount: '20% off',
    calc: (price: number) => price * 0.8,
  },
  {
    type: 'Percentage',
    discount: '25% off',
    calc: (price: number) => price * 0.75,
  },
  {
    type: 'Percentage',
    discount: '30% off',
    calc: (price: number) => price * 0.7,
  },
  {
    type: 'Percentage',
    discount: '40% off',
    calc: (price: number) => price * 0.6,
  },
  {
    type: 'Percentage',
    discount: '50% off',
    calc: (price: number) => price * 0.5,
  },
]
