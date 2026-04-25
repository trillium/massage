import { NextRequest, NextResponse } from 'next/server'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'
import getAccessToken from '@/lib/availability/getAccessToken'
import deleteCalendarEvent from '@/lib/availability/deleteCalendarEvent'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminWithFlag(request)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')
    const q = searchParams.get('q')

    if (!timeMin || !timeMax || !q) {
      return NextResponse.json(
        { error: 'Missing required params: timeMin, timeMax, q' },
        { status: 400 }
      )
    }

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      q,
      singleEvents: 'true',
      orderBy: 'startTime',
    })

    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`
    const response = await fetch(apiUrl, {
      cache: 'no-cache',
      headers: { Authorization: `Bearer ${await getAccessToken()}` },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Calendar API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const blocks = (data.items ?? [])
      .filter((e: { summary?: string }) => e.summary?.includes('[BLOCKED]'))
      .map((e: { id: string; summary: string; start: object; end: object }) => ({
        id: e.id,
        summary: e.summary,
        start: e.start,
        end: e.end,
      }))

    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('Error fetching time blocks:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch time blocks',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminWithFlag(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { eventContainer, date, startTime, endTime, reason } = body

    if (!eventContainer || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: eventContainer, date, startTime, endTime' },
        { status: 400 }
      )
    }

    const summary = `${eventContainer}__EVENT__MEMBER__ [BLOCKED]`
    const description = reason || 'Admin time block created from dashboard'

    const startDateTime = `${date}T${startTime}:00`
    const endDateTime = `${date}T${endTime}:00`

    const eventBody = {
      summary,
      description,
      start: { dateTime: startDateTime, timeZone: 'America/Los_Angeles' },
      end: { dateTime: endDateTime, timeZone: 'America/Los_Angeles' },
    }

    const apiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
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
    console.error('Error creating time block:', error)
    return NextResponse.json(
      {
        error: 'Failed to create time block',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminWithFlag(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: 'Missing required field: eventId' }, { status: 400 })
    }

    await deleteCalendarEvent(eventId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting time block:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete time block',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
