import { REQUEST_PREFIX, SUMMARY_SUFFIX } from './eventHelpers'

export type EventStatus = 'pending' | 'confirmed' | 'cancelled'

export function parseEventSummary(summary: string, calendarStatus: string) {
  const isPending = summary.startsWith(REQUEST_PREFIX)
  const isCancelled = calendarStatus === 'cancelled'

  const status: EventStatus = isCancelled ? 'cancelled' : isPending ? 'pending' : 'confirmed'

  const clean = isPending ? summary.slice(REQUEST_PREFIX.length) : summary
  const withoutSuffix = clean.endsWith(SUMMARY_SUFFIX)
    ? clean.slice(0, -SUMMARY_SUFFIX.length)
    : clean

  const match = withoutSuffix.match(/^(\d+)\s+minute\s+massage\s+with\s+(.+)$/i)

  return {
    status,
    duration: match ? Number(match[1]) : null,
    clientName: match ? match[2] : null,
  }
}
