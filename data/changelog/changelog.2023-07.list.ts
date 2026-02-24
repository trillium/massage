import type { RawMonthData } from './changelog.types'

const data: RawMonthData = {
  date: '2023-07',
  repos: ["www-massage"],
  authorNotes: '',
  commitCount: 12,
  commits: [
    'feat: Integrate price into eventSummary',
    'feat: Improve access to price prop',
    'fix: Update typo --> tel',
    'fix: Add phone to AppointmentProps type',
    'fix: Update site Title to reflect massage',
    'feat: Refactor templates to be more flexible',
    'feat: Update email template - include session info',
    'feat: Add payment hint to session info',
    'Merge pull request #7 from Spiteless/updateCalendarEventParams',
    'fix: Monkeypatch bad import in templates.ts',
    'Merge pull request #9 from Spiteless/ts.hotfixServerlessFunction',
    'chore: add Vercel Analytics',
  ],
}

export default data
