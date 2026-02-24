import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2024-06',
  repos: ['www-massage'],
  commitCount: 2,
  highlights: ['Started migrating to the Next.js App Router'],
  categories: [
    {
      label: 'Infrastructure',
      icon: 'bolt',
      items: [
        'Added the App Router directory with initial files and wired it into the Tailwind config',
      ],
    },
  ],
}

export default summary
