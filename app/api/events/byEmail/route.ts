import { NextRequest, NextResponse } from 'next/server'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Create a wide date range to search through past and future events
    const eighteenMonthsAgo = new Date()
    eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18)

    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

    // Use getEventsBySearchQuery to search for events containing the email
    const events = await getEventsBySearchQuery({
      query: email,
      start: eighteenMonthsAgo,
      end: sixMonthsFromNow,
    })

    // Sort events by start time (most recent first)
    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(a.start?.dateTime || a.start?.date || 0)
      const dateB = new Date(b.start?.dateTime || b.start?.date || 0)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json({
      success: true,
      events: sortedEvents,
      count: sortedEvents.length,
    })
  } catch (error) {
    console.error('Error fetching events by email:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch events',
        success: false,
      },
      { status: 500 }
    )
  }
}
