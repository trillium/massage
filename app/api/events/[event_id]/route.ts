import { NextRequest, NextResponse } from 'next/server'
import { fetchSingleEvent } from 'lib/fetch/fetchSingleEvent'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  const auth = await requireAdminWithFlag(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { event_id } = await params

    if (!event_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event ID is required',
        },
        { status: 400 }
      )
    }

    const event = await fetchSingleEvent(event_id)

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found',
          message: `No event found with ID: ${event_id}`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event,
    })
  } catch (error) {
    console.error('Error fetching single calendar event:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch calendar event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
