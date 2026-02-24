import type { MonthEntry, ChangelogCategory, ChangelogIcon } from './changelog.list'

export type QuarterGroup = {
  label: string
  dateRange: string
  commitCount: number
  repos: string[]
  highlights: string[]
  categories: ChangelogCategory[]
  months?: MonthEntry[]
}

function getQuarterKey(date: string): string {
  const [year, month] = date.split('-').map(Number)
  const q = Math.ceil(month / 3)
  return `${year}-Q${q}`
}

function getQuarterLabel(key: string): string {
  const [year, q] = key.split('-')
  return `${year} ${q}`
}

function formatMonth(date: string): string {
  const d = new Date(`${date}-15`)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatDateRange(months: MonthEntry[]): string {
  if (months.length === 1) return formatMonth(months[0].date)
  return `${formatMonth(months[0].date)} \u2013 ${formatMonth(months[months.length - 1].date)}`
}

function isCurrentQuarter(key: string): boolean {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return key === `${now.getFullYear()}-Q${q}`
}

function mergeCategories(months: MonthEntry[]): ChangelogCategory[] {
  const merged = new Map<string, { icon: ChangelogIcon; items: Set<string> }>()

  for (const month of months) {
    for (const cat of month.categories) {
      const existing = merged.get(cat.label)
      if (existing) {
        for (const item of cat.items) existing.items.add(item)
      } else {
        merged.set(cat.label, { icon: cat.icon, items: new Set(cat.items) })
      }
    }
  }

  return Array.from(merged.entries()).map(([label, { icon, items }]) => ({
    label,
    icon,
    items: Array.from(items),
  }))
}

function mergeHighlights(months: MonthEntry[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const month of months) {
    for (const h of month.highlights) {
      if (!seen.has(h)) {
        seen.add(h)
        result.push(h)
      }
    }
  }
  return result.slice(0, 4)
}

export function buildQuarters(months: MonthEntry[]): QuarterGroup[] {
  const sorted = [...months].sort((a, b) => b.date.localeCompare(a.date))

  const groups = new Map<string, MonthEntry[]>()
  for (const month of sorted) {
    const key = getQuarterKey(month.date)
    const list = groups.get(key) ?? []
    list.push(month)
    groups.set(key, list)
  }

  const quarterKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a))

  return quarterKeys.map((key) => {
    const quarterMonths = groups.get(key)!
    const allRepos = [...new Set(quarterMonths.flatMap((m) => m.repos))]
    const totalCommits = quarterMonths.reduce((sum, m) => sum + m.commitCount, 0)

    if (isCurrentQuarter(key)) {
      return {
        label: getQuarterLabel(key),
        dateRange: formatDateRange(quarterMonths),
        commitCount: totalCommits,
        repos: allRepos,
        highlights: mergeHighlights(quarterMonths),
        categories: mergeCategories(quarterMonths),
        months: quarterMonths,
      }
    }

    return {
      label: getQuarterLabel(key),
      dateRange: formatDateRange(quarterMonths),
      commitCount: totalCommits,
      repos: allRepos,
      highlights: mergeHighlights(quarterMonths),
      categories: mergeCategories(quarterMonths),
    }
  })
}
