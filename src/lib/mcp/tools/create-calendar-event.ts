import type { z } from 'zod'
import type { createCalendarEventSchema } from '../schemas'
import getAccessToken from '@/lib/availability/getAccessToken'

export async function createCalendarEvent(args: z.infer<typeof createCalendarEventSchema>) {
  const {
    summary,
    startDateTime,
    endDateTime,
    description,
    location,
    attendeeEmail,
    attendeeName,
    calendarId = 'primary',
  } = args

  const eventBody: {
    summary: string
    start: { dateTime: string }
    end: { dateTime: string }
    description?: string
    location?: string
    attendees?: Array<{ email: string; displayName?: string; responseStatus: string }>
  } = {
    summary,
    start: { dateTime: startDateTime },
    end: { dateTime: endDateTime },
  }

  if (description) {
    eventBody.description = description
  }

  if (location) {
    eventBody.location = location
  }

  if (attendeeEmail) {
    eventBody.attendees = [
      {
        email: attendeeEmail,
        ...(attendeeName && { displayName: attendeeName }),
        responseStatus: 'needsAction',
      },
    ]
  }

  const apiUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  )
  apiUrl.searchParams.set('sendNotifications', 'true')

  const response = await fetch(apiUrl, {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(eventBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to create calendar event: ${response.status} - ${errorText}`)
  }

  const event = await response.json()

  return {
    content: [
      {
        type: 'text' as const,
        text: `Calendar event created successfully:\n${JSON.stringify(event, null, 2)}`,
      },
    ],
  }
}
