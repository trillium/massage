# Changelog Summary Directive

## Task

Read a `changelog.<YYYY-MM>.list.ts` file containing raw git commit messages.
Write a `changelog.<YYYY-MM>.summary.ts` file containing a human-readable product changelog.

## Input

Each `.list.ts` exports a `RawMonthData` with date, repos, commitCount, an array of commit message strings, and an optional `authorNotes` field. If `authorNotes` is non-empty, treat it as context from the project author about what was happening that month — use it to inform your summary.

## Output

Each `.summary.ts` must export a default `MonthEntry` object conforming to `./changelog.types`.

```ts
import type { MonthEntry } from './changelog.types'

const summary: MonthEntry = {
  date: '2025-08',
  repos: ['massage'],
  commitCount: 192,
  highlights: [
    'Launched redesigned landing page with hero, pricing, and contact sections',
    'Added Pushover push notifications for new bookings',
    'Upgraded to Tailwind v4',
  ],
  categories: [
    {
      label: 'Landing Page',
      icon: 'paint',
      items: [
        'Built hero section with dual image layout and gradient text',
        'Added pricing section with discount display and booking links',
        'Created contact page with form submission and API route',
        'Redesigned footer with responsive 4-column grid',
      ],
    },
  ],
}

export default summary
```

## Rules

### Highlights
- 2-4 items max
- One sentence each, product-focused
- Answer "what can the user/admin do now that they couldn't before?"
- Lead with the most impactful change
- Write in first person implied voice (e.g. "Discovered Tim Feeley's..." not "Trillium discovered..."). The changelog is written from the author's perspective — no need to name the author, but always attribute external people and projects by name.

### Categories
- Group related work into named categories (e.g. "Booking", "Authentication", "Infrastructure")
- Each category gets an icon from: `calendar`, `shield`, `bolt`, `paint`, `tools`, `bell`, `map`, `images`, `code`, `globe`
- Pick icons by content: `calendar` for booking, `shield` for auth/security, `bolt` for architecture/perf, `paint` for UI/design, `tools` for infra/devex, `bell` for notifications, `map` for location/maps, `images` for gallery/media, `code` for testing/developer, `globe` for launch/deploy

### Category Items
- Describe what was BUILT or CHANGED, not what commits said
- Use plain language a product manager would write
- Past tense ("Added", "Fixed", "Migrated", "Replaced")
- Merge related commits into single items (10 commits touching auth can be 2-3 items)
- Omit pure chore/style/merge commits unless they represent meaningful work
- Don't recite commit messages — synthesize them into outcomes
- Use plain maintainer voice, not marketing voice. No self-aggrandizing adjectives like "critical", "powerful", "robust", "comprehensive", "elegant". Just say what was done. "Fixed timezone bugs" not "Fixed critical timezone bugs". We're maintainers, not writing a press release.
- Choose humble verbs. "Found" not "discovered" — someone else built the thing, we just came across it. "Built" not "engineered". "Added" not "introduced". Keep it grounded.
- Describe capabilities, not specific values. Say "Added configurable pricing tiers" not "Added pricing tiers ($120/$180/$240/$300)". Say "Added minimum duration setting for appointments" not "Set minimum duration to 60 minutes". Dollar amounts, specific durations, exact counts, and other hardcoded values belong in code, not changelogs — they change over time and date the entry.

### What to omit
- Merge commits
- Pure linting/formatting commits (unless it was a major tooling migration like "ESLint to Biome")
- Console.log removal
- Lockfile updates
- Dependency bumps (unless it's a framework upgrade like Next.js or React)

### Scale
- Months with 1-5 commits: 1 category, 1-2 highlights
- Months with 10-50 commits: 2-4 categories, 2-3 highlights
- Months with 50-200 commits: 4-7 categories, 3-4 highlights

### Using Previous Summaries for Context
If you need more context to understand what a month's commits are building on, you may read the previous month's `.summary.ts` file. This helps when commit messages reference things that were introduced in earlier months (e.g. "fix auth bug" makes more sense if you know auth was added the month before). Don't copy from previous summaries — just use them to inform your understanding.

### Context
This is a massage booking website (trilliummassage.la). The project evolved from:
- `meet` — Tim Feeley's open-source Calendly alternative (May-Jun 2023)
- `www-massage` — Trillium's standalone booking site forked from meet (Jun 2023-Jan 2025)
- `massage` — Current production site on tailwind-nextjs-starter-blog (Dec 2024-present)

The changelog covers all three repos chronologically.
