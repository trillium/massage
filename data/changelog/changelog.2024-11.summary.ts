import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-11',
  repos: ['www-massage'],
  commitCount: 1,
  highlights: ['Switched duration picker to radio buttons for clearer selection'],
  categories: [
    {
      label: 'Booking',
      icon: 'calendar',
      items: ['Changed duration picker from dropdown to radio button inputs'],
    },
  ],
}

export default summary
