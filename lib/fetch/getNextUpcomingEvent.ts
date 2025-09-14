import { GoogleCalendarV3Event } from '@/lib/types'
import { fetchAllCalendarEvents } from './fetchContainersByQuery'
import { addHours, isAfter } from 'date-fns'

/**
 * Finds the next upcoming event that contains '__EVENT__' in its summary,
 * within the next 18 hours. Events containing 'next_exclude__EVENT__' in their
 * summary or description are excluded. If no event is found, returns null.
 */
export async function getNextUpcomingEvent(): Promise<GoogleCalendarV3Event | null> {
  try {
    const now = new Date()
    const eighteenHoursFromNow = addHours(now, 18)

    // Fetch all calendar events in the next 18 hours
    const { allEvents } = await fetchAllCalendarEvents({
      searchParams: {},
      options: {
        startDate: now,
        endDate: eighteenHoursFromNow,
      },
    })

    // Filter events that contain '__EVENT__' and are in the future
    const systemEvents = allEvents
      .filter((event) => {
        // Must contain '__EVENT__' in summary OR description
        const hasEventTag =
          event.summary?.includes('__EVENT__') || event.description?.includes('__EVENT__')
        if (!hasEventTag) {
          return false
        }

        // Must NOT contain 'next-exclude__EVENT__' in summary or description (these should be excluded from next booking)
        if (
          event.summary?.includes('next-exclude__EVENT__') ||
          event.description?.includes('next-exclude__EVENT__')
        ) {
          return false
        }

        // Must have a start time
        if (!event.start?.dateTime) {
          return false
        }

        // Must be in the future
        const eventStartTime = new Date(event.start.dateTime)
        return isAfter(eventStartTime, now)
      })
      // Sort by start time (earliest first)
      .sort((a, b) => {
        const dateA = new Date(a.start!.dateTime!)
        const dateB = new Date(b.start!.dateTime!)
        return dateA.getTime() - dateB.getTime()
      })

    // Return the first (earliest) event, or null if none found
    return systemEvents[0] || null
  } catch (error) {
    console.error('Error fetching next upcoming event:', error)
    return null
  }
}
