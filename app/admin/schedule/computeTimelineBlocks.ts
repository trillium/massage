import { GoogleCalendarV3Event } from '@/lib/types'

export type TimelineBlockData = {
  type: 'member' | 'gap'
  start: string
  end: string
  durationMinutes: number
  event?: GoogleCalendarV3Event
}

export function computeTimelineBlocks(
  container: GoogleCalendarV3Event,
  members: GoogleCalendarV3Event[]
): TimelineBlockData[] {
  const containerStart = new Date(container.start.dateTime!).getTime()
  const containerEnd = new Date(container.end.dateTime!).getTime()

  const sorted = members
    .filter((m) => {
      const mStart = new Date(m.start.dateTime!).getTime()
      const mEnd = new Date(m.end.dateTime!).getTime()
      return mEnd > containerStart && mStart < containerEnd
    })
    .sort((a, b) => new Date(a.start.dateTime!).getTime() - new Date(b.start.dateTime!).getTime())

  const blocks: TimelineBlockData[] = []
  let cursor = containerStart

  for (const member of sorted) {
    const mStart = Math.max(new Date(member.start.dateTime!).getTime(), containerStart)
    const mEnd = Math.min(new Date(member.end.dateTime!).getTime(), containerEnd)

    if (mStart > cursor) {
      blocks.push({
        type: 'gap',
        start: new Date(cursor).toISOString(),
        end: new Date(mStart).toISOString(),
        durationMinutes: (mStart - cursor) / 60000,
      })
    }

    blocks.push({
      type: 'member',
      start: new Date(mStart).toISOString(),
      end: new Date(mEnd).toISOString(),
      durationMinutes: (mEnd - mStart) / 60000,
      event: member,
    })

    cursor = Math.max(cursor, mEnd)
  }

  if (cursor < containerEnd) {
    blocks.push({
      type: 'gap',
      start: new Date(cursor).toISOString(),
      end: new Date(containerEnd).toISOString(),
      durationMinutes: (containerEnd - cursor) / 60000,
    })
  }

  return blocks
}
