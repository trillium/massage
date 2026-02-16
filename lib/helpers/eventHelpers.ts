import { GoogleCalendarV3Event } from '@/lib/types'

const REQUEST_PREFIX = 'REQUEST: '

export const isRequestEvent = (event: GoogleCalendarV3Event): boolean =>
  event.summary?.startsWith(REQUEST_PREFIX) ?? false

export const getCleanSummary = (event: GoogleCalendarV3Event): string => {
  if (isRequestEvent(event)) {
    return event.summary.slice(REQUEST_PREFIX.length)
  }
  return event.summary || 'Untitled Event'
}

export const extractApprovalUrls = (
  description?: string
): { acceptUrl: string | null; declineUrl: string | null } => {
  if (!description) return { acceptUrl: null, declineUrl: null }

  const acceptMatch = description.match(/href="([^"]*\/api\/confirm[^"]*)"/)
  const declineMatch = description.match(/href="([^"]*\/api\/decline[^"]*)"/)

  return {
    acceptUrl: acceptMatch?.[1] ?? null,
    declineUrl: declineMatch?.[1] ?? null,
  }
}

export const categorizeEvents = (events: GoogleCalendarV3Event[]) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const pendingEvents: GoogleCalendarV3Event[] = []
  const futureEvents: GoogleCalendarV3Event[] = []
  const todayEvents: GoogleCalendarV3Event[] = []
  const pastEvents: GoogleCalendarV3Event[] = []

  events.forEach((event) => {
    if (event.summary === 'CURRENT_LOCATION') return

    if (isRequestEvent(event)) {
      pendingEvents.push(event)
      return
    }

    const eventStart = event.start?.dateTime || event.start?.date
    if (!eventStart) {
      pastEvents.push(event) // If no start time, consider it past
      return
    }

    const eventDate = new Date(eventStart)
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())

    if (eventDay.getTime() === today.getTime()) {
      todayEvents.push(event)
    } else if (eventDay.getTime() > today.getTime()) {
      futureEvents.push(event)
    } else {
      pastEvents.push(event)
    }
  })

  const sortByDate = (a: GoogleCalendarV3Event, b: GoogleCalendarV3Event) => {
    const dateA = new Date(a.start?.dateTime || a.start?.date || 0)
    const dateB = new Date(b.start?.dateTime || b.start?.date || 0)
    return dateA.getTime() - dateB.getTime()
  }

  pendingEvents.sort(sortByDate)
  futureEvents.sort(sortByDate)
  todayEvents.sort(sortByDate)
  pastEvents.sort((a, b) => -sortByDate(a, b))

  return { pendingEvents, futureEvents, todayEvents, pastEvents }
}
