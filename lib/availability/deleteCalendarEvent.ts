import getAccessToken from 'lib/availability/getAccessToken'

export default async function deleteCalendarEvent(eventId: string, calendarId: string = 'primary') {
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`

  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
    },
  })

  // 204 = deleted, 410 = already gone — both are success
  if (response.status === 204 || response.status === 410) {
    return { success: true }
  }

  throw new Error(`Failed to delete calendar event ${eventId}: ${response.status}`)
}
