import { NextRequest, NextResponse } from 'next/server'
import getAccessToken from 'lib/availability/getAccessToken'
import { GoogleCalendarV3Event } from 'lib/types'
import { AdminAuthManager } from '@/lib/adminAuth'

export async function PATCH(request: NextRequest) {
  try {
    const auth = AdminAuthManager.requireAdmin(request)
    if (auth instanceof NextResponse) return auth
    const body = await request.json()
    const { eventId, updateData } = body

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event ID is required',
        },
        { status: 400 }
      )
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Update data is required',
        },
        { status: 400 }
      )
    }

    const accessToken = await getAccessToken()
    const calendarId = 'primary' // Use 'primary' for the primary calendar

    // Update the event using the Google Calendar API
    const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events/${encodeURIComponent(eventId)}`

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData),
      cache: 'no-cache',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Event not found',
            message: `No event found with ID: ${eventId}`,
          },
          { status: 404 }
        )
      }

      const errorData = await response.text()
      console.error('Google Calendar API error:', response.status, errorData)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update calendar event',
          message: `Google Calendar API error: ${response.status} ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      )
    }

    const updatedEvent: GoogleCalendarV3Event = await response.json()

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: 'Event updated successfully',
    })
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update calendar event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Alias POST to PATCH for convenience
  return PATCH(request)
}
