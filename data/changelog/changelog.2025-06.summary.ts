import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-06',
  repos: ['massage'],
  commitCount: 1,
  highlights: [
    'Migrated test suite from Jest to Vitest with updated mocks and type usage',
  ],
  categories: [
    {
      label: 'Testing',
      icon: 'code',
      items: [
        'Migrated all tests from Jest to Vitest, updating mocks and type imports to match the new runner',
      ],
    },
  ],
}

export default summary
