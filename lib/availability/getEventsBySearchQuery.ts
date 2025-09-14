import { formatDatetimeToString } from '@/lib/helpers'
import { GoogleCalendarFetchDataReturnType } from '@/lib/types'
import getAccessToken from './getAccessToken' // Reuse existing function to get access token

export async function getEventsBySearchQuery({
  start,
  end,
  query,
}: {
  query: string
  start?: string | Date
  end?: string | Date
}) {
  const accessToken = await getAccessToken()
  const calendarId = 'primary' // Use 'primary' for the primary calendar or specify another calendar ID
  const urlBase = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?q=${encodeURIComponent(query)}&orderBy=startTime&singleEvents=true`

  let url = urlBase

  if (start) {
    let timeMin: string

    if (typeof start === 'string') {
      timeMin = formatDatetimeToString(new Date(start))
    } else if (start instanceof Date) {
      timeMin = formatDatetimeToString(start)
    } else {
      throw new Error('Invalid type for start parameter')
    }

    url += `&timeMin=${encodeURIComponent(timeMin)}`
  }

  if (end) {
    let timeMax: string

    if (typeof end === 'string') {
      timeMax = formatDatetimeToString(new Date(end))
    } else if (end instanceof Date) {
      timeMax = formatDatetimeToString(end)
    } else {
      throw new Error('Invalid type for end parameter')
    }

    url += `&timeMax=${encodeURIComponent(timeMax)}`
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 1 },
  })

  if (!response.ok) {
    throw new Error(`Error fetching events: ${response.statusText}`)
  }

  const data: GoogleCalendarFetchDataReturnType = await response.json()
  return data.items
}

// Availability will be defined by calendar events called (name)_CONTAINER
// sub events will take up event container time and have (name) in their summary or body
