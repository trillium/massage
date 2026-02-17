const REQUEST_PREFIX = 'REQUEST: '
const SUFFIX = ' - TrilliumMassage'

export type EventStatus = 'pending' | 'confirmed' | 'cancelled'

export function parseEventSummary(summary: string, calendarStatus: string) {
  const isPending = summary.startsWith(REQUEST_PREFIX)
  const isCancelled = calendarStatus === 'cancelled'

  const status: EventStatus = isCancelled ? 'cancelled' : isPending ? 'pending' : 'confirmed'

  const clean = isPending ? summary.slice(REQUEST_PREFIX.length) : summary
  const withoutSuffix = clean.endsWith(SUFFIX) ? clean.slice(0, -SUFFIX.length) : clean

  const match = withoutSuffix.match(/^(\d+)\s+minute\s+massage\s+with\s+(.+)$/i)

  return {
    status,
    duration: match ? Number(match[1]) : null,
    clientName: match ? match[2] : null,
  }
}
