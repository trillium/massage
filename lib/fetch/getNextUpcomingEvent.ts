import { GoogleCalendarV3Event } from '@/lib/types'
import { fetchAllCalendarEvents } from './fetchContainersByQuery'
import { addHours, isAfter } from 'date-fns'

/**
 * Finds the next upcoming event OR current event (if in progress) that contains '__EVENT__' in its summary.
 * Looks within the next 18 hours. Events containing 'next-exclude__EVENT__' in their
 * summary or description are excluded. If no event is found, returns null.
 *
 * Returns:
 * - Current event (if one is in progress now)
 * - OR next upcoming event (if no current event)
 * - OR null (if no events found)
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

    // Filter events that contain '__EVENT__' and are in the future or in progress now
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

        // Must be in the future OR currently in progress
        const eventStartTime = new Date(event.start.dateTime)
        const eventEndTime = event.end?.dateTime ? new Date(event.end.dateTime) : null

        // Include if: event starts in the future OR event is happening now
        const isUpcoming = isAfter(eventStartTime, now)
        const isInProgress = eventEndTime && eventStartTime <= now && eventEndTime > now

        return isUpcoming || isInProgress
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
