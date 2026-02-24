export type ChangelogIcon =
  | 'calendar'
  | 'shield'
  | 'bolt'
  | 'paint'
  | 'tools'
  | 'bell'
  | 'map'
  | 'images'
  | 'code'
  | 'globe'

export type ChangelogCategory = {
  label: string
  icon: ChangelogIcon
  items: string[]
}

export type RawMonthData = {
  date: string
  repos: string[]
  commitCount: number
  commits: string[]
  authorNotes?: string
}

export type MonthEntry = {
  date: string
  repos: string[]
  commitCount: number
  highlights: string[]
  categories: ChangelogCategory[]
}
