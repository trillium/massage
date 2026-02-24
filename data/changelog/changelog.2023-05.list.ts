import type { RawMonthData } from './changelog.types'

const data: RawMonthData = {
  date: '2023-05',
  repos: ["www-massage"],
  authorNotes: 'This is the origin story. I found Tim Feeley\'s open-source Calendly alternative (timfee/meet) on GitHub. It had the serverless Google Calendar FreeBusy API architecture I needed to build a massage booking site without a heavy backend. My first commit was a one-line bugfix — calendar invites were hardcoded to say "meeting with Tim" so I replaced it with an env variable. From that fix I kept contributing upstream and eventually forked it into my own massage booking platform.',
  commitCount: 6,
  commits: [
    'fix: Use env variable name in calendar invite',
    'fix: Update test to always be a future date',
    'fix: StringInveral -> StringInterval',
    'feat: Create LEAD_TIME variable with default 0',
    'feat: Update getAvailability to use leadTime',
    'asset: Update config with potential open hours',
  ],
}

export default data
