import { NextResponse } from 'next/server'
import { searchSootheEmails } from '@/lib/gmail/searchSootheEmails'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'

export async function GET(request: Request) {
  try {
    const auth = await requireAdminWithFlag(request)
    if (auth instanceof NextResponse) return auth
    const { searchParams } = new URL(request.url)
    const maxResults = parseInt(searchParams.get('maxResults') || '50')
    const daysBack = parseInt(searchParams.get('daysBack') || '1')

    const { bookings, failedMessageIds } = await searchSootheEmails(maxResults, daysBack)

    return Response.json({
      success: true,
      count: bookings.length,
      failedMessageIds,
      daysSearched: daysBack,
      bookings: bookings.map((booking) => ({
        clientName: booking.clientName,
        sessionType: booking.sessionType,
        duration: booking.duration,
        isCouples: booking.isCouples,
        location: booking.location,
        payout: booking.payout,
        tip: booking.tip,
        notes: booking.notes,
        extraServices: booking.extraServices,
        messageId: booking.rawMessage.id,
        date: new Date(parseInt(booking.rawMessage.internalDate)).toISOString(),
        subject: booking.rawMessage.payload.headers.find((h) => h.name === 'Subject')?.value || '',
      })),
    })
  } catch (error) {
    console.error('Error searching Soothe emails:', error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
