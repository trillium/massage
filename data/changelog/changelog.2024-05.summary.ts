import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-05',
  repos: ['www-massage'],
  commitCount: 2,
  highlights: ['Updated Next.js to patch a security vulnerability'],
  categories: [
    {
      label: 'Infrastructure',
      icon: 'tools',
      items: [
        'Updated Next.js to address a security vulnerability and fixed a router type that broke with the upgrade',
      ],
    },
  ],
}

export default summary
