import getAccessToken from 'lib/availability/getAccessToken'

export default async function updateCalendarEvent(
  eventId: string,
  updateData: Record<string, unknown>,
  calendarId: string = 'primary'
) {
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(updateData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update calendar event ${eventId}: ${response.status}`)
  }

  return response.json()
}
