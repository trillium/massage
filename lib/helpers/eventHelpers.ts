import { GoogleCalendarV3Event } from '@/lib/types'

/**
 * Categorizes events into past, today, and future events.
 * @param events - Array of GoogleCalendarV3Event objects.
 * @returns An object containing categorized events.
 */
export const categorizeEvents = (events: GoogleCalendarV3Event[]) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const futureEvents: GoogleCalendarV3Event[] = []
  const todayEvents: GoogleCalendarV3Event[] = []
  const pastEvents: GoogleCalendarV3Event[] = []

  events.forEach((event) => {
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

  // Sort events within each category by date
  const sortByDate = (a: GoogleCalendarV3Event, b: GoogleCalendarV3Event) => {
    const dateA = new Date(a.start?.dateTime || a.start?.date || 0)
    const dateB = new Date(b.start?.dateTime || b.start?.date || 0)
    return dateA.getTime() - dateB.getTime()
  }

  futureEvents.sort(sortByDate)
  todayEvents.sort(sortByDate)
  pastEvents.sort((a, b) => -sortByDate(a, b)) // Reverse order for past events (most recent first)

  return { futureEvents, todayEvents, pastEvents }
}
