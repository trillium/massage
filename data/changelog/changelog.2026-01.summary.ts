import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2026-01',
  repos: ['massage'],
  commitCount: 1,
  highlights: [
    'Added a new Airbnb review to the ratings collection',
  ],
  categories: [
    {
      label: 'Content',
      icon: 'paint',
      items: [
        'Added 1 Airbnb review to the ratings data',
      ],
    },
  ],
}

export default summary
