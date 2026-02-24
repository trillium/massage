import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-12',
  repos: ['massage'],
  commitCount: 16,
  highlights: [
    'Added automatic PostHog user identification on Supabase auth events',
    'Published two blog posts with styled booking components and an AirbnbCouponTable',
  ],
  categories: [
    {
      label: 'Blog & Content',
      icon: 'paint',
      items: [
        'Published Airbnb promo post with expiration notice and signup link',
        'Created "went to book on Airbnb" blog post',
        'Built AirbnbCouponTable component for displaying promo codes in posts',
        'Created StyledBookButton for use in blog MDX without the Link wrapper',
        'Added blog:build and blog:watch scripts for Contentlayer2 development',
      ],
    },
    {
      label: 'Reviews & Analytics',
      icon: 'bolt',
      items: [
        'Added automatic PostHog user identification on auth events',
        'Added 11 new reviews from Airbnb and Soothe',
      ],
    },
    {
      label: 'Infrastructure',
      icon: 'tools',
      items: [
        'Upgraded Next.js to 16.0.7',
        'Added large-file allowlist to pre-commit hook for ratings data',
      ],
    },
  ],
}

export default summary
