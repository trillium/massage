import { NextRequest, NextResponse } from 'next/server'
import createAdminAppointment from '@/lib/messaging/templates/events/createAdminAppointment'
import adminAppointmentDescription from '@/lib/messaging/templates/events/adminAppointmentDescription'
import createManualAdminAppointment from '@/lib/messaging/templates/events/createManualAdminAppointment'
import manualAdminAppointmentDescription from '@/lib/messaging/templates/events/manualAdminAppointmentDescription'
import { AdminAuthManager } from '@/lib/adminAuth'

/**
 * POST /api/admin/create-appointment
 * Creates a calendar appointment from admin interface
 * Supports both Soothe booking data and manual entry data
 */
export async function POST(request: NextRequest) {
  try {
    const auth = AdminAuthManager.requireAdmin(request)
    if (auth instanceof NextResponse) return auth
    const body = await request.json()

    // Validate required fields
    const { booking, selectedTime, selectedLocation, selectedDay } = body

    if (!booking || !selectedTime || !selectedLocation || !selectedDay) {
      return NextResponse.json(
        { error: 'Missing required fields: booking, selectedTime, selectedLocation, selectedDay' },
        { status: 400 }
      )
    }

    // Determine platform type
    const platform = booking.platform || 'Soothe'

    // Validate platform-specific required fields
    if (platform === 'Soothe') {
      if (!booking.messageId || !booking.date || !booking.subject) {
        return NextResponse.json(
          { error: 'Soothe bookings require messageId, date, and subject' },
          { status: 400 }
        )
      }
    }

    // Validate selectedTime object
    if (!selectedTime.start || !selectedTime.end) {
      return NextResponse.json({ error: 'selectedTime must have start and end' }, { status: 400 })
    }

    // Validate selectedDay object
    if (
      typeof selectedDay.year !== 'number' ||
      typeof selectedDay.month !== 'number' ||
      typeof selectedDay.day !== 'number'
    ) {
      return NextResponse.json(
        { error: 'selectedDay must have numeric year, month, and day' },
        { status: 400 }
      )
    }

    // Create the appointment
    /**
     * Creates and submits a calendar appointment for admin-created bookings.
     * This function handles the complete flow from booking data to calendar creation.
     * Supports both Soothe and ManualEntry platforms.
     *
     * @function
     * @param {Object} params - The appointment creation parameters
     * @returns {Promise<Response>} Returns the Google Calendar API response
     */
    async function createAndSubmitAdminAppointment(params: {
      platform: 'Soothe' | 'ManualEntry'
      booking: {
        clientName?: string
        sessionType?: string
        duration?: string
        isCouples?: boolean
        location?: string
        payout?: string
        tip?: string
        notes?: string
        extraServices?: string[]
        messageId?: string
        date?: string
        subject?: string
      }
      selectedTime: {
        start: string
        end: string
      }
      selectedLocation: string
      selectedDay: {
        year: number
        month: number
        day: number
        toString: () => string
      }
    }): Promise<Response> {
      let appointmentProps
      let description

      // Route to correct template based on platform
      if (params.platform === 'ManualEntry') {
        appointmentProps = await createManualAdminAppointment(params)
        description = await manualAdminAppointmentDescription(appointmentProps)
      } else {
        // For Soothe bookings, we've validated messageId, date, subject exist
        appointmentProps = await createAdminAppointment({
          ...params,
          booking: {
            ...params.booking,
            messageId: params.booking.messageId!,
            date: params.booking.date!,
            subject: params.booking.subject!,
          },
        })
        description = await adminAppointmentDescription(appointmentProps)
      }

      // Import the calendar creation function dynamically to avoid circular dependencies
      const { default: createCalendarAppointment } = await import(
        '@/lib/availability/createCalendarAppointment'
      )

      // Create the calendar appointment with custom description
      return createCalendarAppointment({
        ...appointmentProps,
        customDescription: description,
      })
    }

    const response = await createAndSubmitAdminAppointment({
      platform,
      booking,
      selectedTime,
      selectedLocation,
      selectedDay,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Calendar API error: ${response.status} - ${errorText}`)
    }

    const calendarEvent = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      event: {
        id: calendarEvent.id,
        summary: calendarEvent.summary,
        start: calendarEvent.start,
        end: calendarEvent.end,
        location: calendarEvent.location,
        htmlLink: calendarEvent.htmlLink,
      },
    })
  } catch (error) {
    console.error('Error creating admin appointment:', error)

    return NextResponse.json(
      {
        error: 'Failed to create appointment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
