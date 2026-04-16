import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import getAccessToken from '@/lib/availability/getAccessToken'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminWithFlag(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { containerQuery, date, startTime, endTime, titlePrefix } = body

    if (!containerQuery || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: containerQuery, date, startTime, endTime' },
        { status: 400 }
      )
    }

    const containerString = `${containerQuery}__EVENT__CONTAINER__`
    const summary = titlePrefix ? `${titlePrefix} ${containerString}` : containerString

    const startDateTime = `${date}T${startTime}:00`
    const endDateTime = `${date}T${endTime}:00`

    const eventBody = {
      summary,
      start: { dateTime: startDateTime, timeZone: 'America/Los_Angeles' },
      end: { dateTime: endDateTime, timeZone: 'America/Los_Angeles' },
    }

    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events`
    const response = await fetch(apiUrl, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify(eventBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Calendar API error: ${response.status} - ${errorText}`)
    }

    const calendarEvent = await response.json()

    return NextResponse.json({
      success: true,
      event: {
        id: calendarEvent.id,
        summary: calendarEvent.summary,
        start: calendarEvent.start,
        end: calendarEvent.end,
        htmlLink: calendarEvent.htmlLink,
      },
    })
  } catch (error) {
    console.error('Error creating container:', error)
    return NextResponse.json(
      {
        error: 'Failed to create container',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
