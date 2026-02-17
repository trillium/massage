import { GoogleCalendarV3Event } from '@/lib/types'
import getAccessToken from '@/lib/availability/getAccessToken'

/**
 * Fetches a single Google Calendar event by its ID
 * @param eventId - The Google Calendar event ID
 * @returns The event object or null if not found
 */
export async function fetchSingleEvent(eventId: string): Promise<GoogleCalendarV3Event | null> {
  if (!eventId) {
    console.error('fetchSingleEvent: eventId is required')
    return null
  }

  try {
    const accessToken = await getAccessToken()
    const calendarId = 'primary' // Use 'primary' for the primary calendar

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events/${encodeURIComponent(eventId)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }

      const errorText = await response.text()
      console.error(`Failed to fetch event ${eventId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return null
    }

    const event: GoogleCalendarV3Event = await response.json()

    // Validate that we got a valid event with required fields
    if (!event.id) {
      console.error('Received invalid event data:', event)
      return null
    }

    return event
  } catch (error) {
    console.error('Error fetching single event:', error)
    return null
  }
}

export default fetchSingleEvent
