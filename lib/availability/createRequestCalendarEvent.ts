import getAccessToken from 'lib/availability/getAccessToken'

export default async function createRequestCalendarEvent({
  start,
  end,
  summary,
  description,
  location,
  calendarId = 'primary',
}: {
  start: string
  end: string
  summary: string
  description: string
  location?: string
  calendarId?: string
}) {
  const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`

  const body: Record<string, unknown> = {
    start: { dateTime: start },
    end: { dateTime: end },
    summary,
    description,
  }

  if (location) {
    body.location = location
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Failed to create request calendar event: ${response.status}`)
  }

  return response.json()
}
