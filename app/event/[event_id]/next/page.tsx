import { fetchData } from '@/lib/fetch/fetchData'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import {
  GoogleCalendarV3Event,
  StringDateTimeIntervalAndLocation,
  LocationObject,
} from '@/lib/types'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import BookingForm from '@/components/booking/BookingForm'
import { addMinutes, isBefore } from 'date-fns'
import { DEFAULT_PRICING, ALLOWED_DURATIONS, DEFAULT_DURATION } from 'config'
import Day from '@/lib/day'
import {
  getAvailableNextSlots,
  convertToTimeListFormat,
} from '@/lib/availability/getNextSlotAvailability'

interface NextBookingPageProps {
  params: Promise<{ event_id: string }>
}

export default async function NextBookingPage({ params }: NextBookingPageProps) {
  const { event_id } = await params
  // Fetch busy/availability
  const data = await fetchData({ searchParams: {} })
  // Fetch the single event details
  const currentEvent: GoogleCalendarV3Event | null = await fetchSingleEvent(event_id)

  if (!currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <h2 className="mb-4 text-2xl font-semibold text-red-800 dark:text-red-200">
              Error Loading Event
            </h2>
            <p className="text-red-700 dark:text-red-300">Event not found</p>
          </div>
        </div>
      </div>
    )
  }

  const eventEndTime = currentEvent.end?.dateTime ? new Date(currentEvent.end.dateTime) : null
  const thirtyMinutesAfter = eventEndTime ? addMinutes(eventEndTime, 30) : null

  // Use the new availability selector to get conflict-free slots
  const availableSlots = await getAvailableNextSlots({
    currentEvent,
    appointmentDuration: DEFAULT_DURATION,
    slotInterval: 15, // 15-minute increments
    maxMinutesAhead: 30, // Look 30 minutes ahead
  })

  // Convert to format expected by TimeList component
  const slots = convertToTimeListFormat(availableSlots)

  const eventEndTimeStr = eventEndTime ? eventEndTime.toLocaleString() : 'Unknown'
  const thirtyMinutesAfterStr = thirtyMinutesAfter ? thirtyMinutesAfter.toLocaleString() : 'Unknown'

  // Convert Day instances to plain objects for client component
  function dayWithStartEndObj(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return { start: dateStr, end: dateStr, year, month, day }
  }
  const startObj = dayWithStartEndObj(data.start)
  const endObj = dayWithStartEndObj(data.end)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Book Next Available Slot
          </h1>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Current Event: {currentEvent.summary || 'Untitled Event'}
            </h2>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Event ends at:</strong> {eventEndTimeStr}
              </p>
              <p>
                <strong>Available booking window:</strong> Until {thirtyMinutesAfterStr}
              </p>
              {currentEvent.location && (
                <p>
                  <strong>Location:</strong> {currentEvent.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Set Redux slots and busy times for the booking UI */}
        <UpdateSlotsUtility
          busy={data.busy}
          containers={[currentEvent]}
          start={startObj}
          end={endObj}
          configObject={null}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Booking Configuration */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Duration</h3>
              <DurationPicker
                title={`${DEFAULT_DURATION} minute session - $${DEFAULT_PRICING[DEFAULT_DURATION]}`}
                duration={DEFAULT_DURATION}
                price={DEFAULT_PRICING}
                allowedDurations={ALLOWED_DURATIONS}
                configuration={null}
              />
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Date</h3>
              <Calendar />
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Available Times
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  (Within 30 minutes after current event)
                </span>
              </h3>
              {slots.length > 0 ? (
                <TimeList />
              ) : (
                <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                  <p>No available time slots</p>
                  <p className="mt-1 text-xs">
                    Time slots are only available within 30 minutes after the current event ends
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
              Book Your Session
            </h3>
            <BookingForm endPoint="/api/book" />
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <a
            href={`/event/${event_id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Event Details
          </a>
        </div>
      </div>
    </div>
  )
}
