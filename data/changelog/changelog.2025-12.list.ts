import type { RawMonthData } from './changelog.types'

const data: RawMonthData = {
  date: '2025-12',
  repos: ["massage"],
  authorNotes: '',
  commitCount: 16,
  commits: [
    'feat(ratings): add two new 5-star Airbnb reviews',
    'feat(analytics): implement automatic PostHog user identification on auth',
    'chore(deps): Upgrade nextjs to 16.0.7',
    'feat(blog): add expiration notice to Airbnb promo post with signup link',
    'feat(blog): style Airbnb link as button with brand colors',
    'style(button): Add white hover to BookSessionButton for light mode',
    'feat(blog): Create StyledBookButton without Link component',
    'feat(blog): Create went-to-book-on-airbnb blog',
    'chore(ci): Add data/ratings.js to large file ignore list',
    'chore(reviews): Remove helpful tag from review',
    'feat(blog): Create AirbnbCouponTable for blog post',
    'chore(scripts): add blog:build and blog:watch scripts for contentlayer2',
    'refactor(components): move AirbnbCouponTable to subfolder, extract constants, add barrel export',
    'chore(ratings): Add 4 Soothe reviews',
    'chore(ratings): Add 5 Airbnb reviews',
    'chore(pre-commit): add allowlist for large files and skip check for allowlisted files',
  ],
}

export default data
