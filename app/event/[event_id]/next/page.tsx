import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { NextSlotUpdateUtility } from '@/components/utilities/NextSlotUpdateUtility'
import { DynamicTimeList } from '@/components/availability/DynamicTimeList'
import { GoogleCalendarV3Event, StringDateTimeIntervalAndLocation } from '@/lib/types'
import Calendar from '@/components/availability/date/Calendar'
import BookingForm from '@/components/booking/BookingForm'
import { addMinutes } from 'date-fns'
import { DEFAULT_PRICING, ALLOWED_DURATIONS, DEFAULT_DURATION } from 'config'
import { createMultiDurationAvailability } from '@/lib/availability/getNextSlotAvailability'
import Link from '@/components/Link'
import MapTile from '@/components/MapTile'
import { geocodeLocation } from '@/lib/geocode'
import { IMAGE_CONFIG } from '@/lib/mapConfig'
import DurationPicker from '@/components/availability/controls/DurationPicker'

interface NextBookingPageProps {
  params: Promise<{ event_id: string }>
}

export default async function NextBookingPage({ params }: NextBookingPageProps) {
  const { event_id } = await params
  // // Fetch busy/availability
  // const data = await fetchData({ searchParams: {} })
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

  // Use multi-duration availability system for flexible next-slot booking
  const multiDurationAvailability = await createMultiDurationAvailability({
    currentEvent,
    durationOptions: ALLOWED_DURATIONS, // Use all allowed durations
    slotInterval: 15, // 15-minute increments
    maxMinutesAhead: 30, // Look 30 minutes ahead
  })

  // Serialize multi-duration availability data for client components
  const multiDurationSlots: Record<number, StringDateTimeIntervalAndLocation[]> = {}
  for (const duration of ALLOWED_DURATIONS) {
    multiDurationSlots[duration] = multiDurationAvailability.getTimeListFormatForDuration(duration)
  }

  const eventEndTimeStr = eventEndTime ? eventEndTime.toLocaleString() : 'Unknown'
  const thirtyMinutesAfterStr = thirtyMinutesAfter ? thirtyMinutesAfter.toLocaleString() : 'Unknown'

  // Geocode the event location to get coordinates for the map
  // Use the same defaults as MapTile component
  const mapCoordinates = {
    longitude: -118.2437, // Default Los Angeles coordinates (matches MapTile DEFAULT_VIEW)
    latitude: 34.0522,
    zoom: IMAGE_CONFIG.zoom, // Use zoom from mapConfig
  }

  if (currentEvent.location) {
    try {
      const geocodeResult = await geocodeLocation(currentEvent.location)
      if (geocodeResult.success && geocodeResult.coordinates) {
        mapCoordinates.longitude = geocodeResult.coordinates.lng
        mapCoordinates.latitude = geocodeResult.coordinates.lat
      } else {
        console.warn('Geocoding failed for location:', currentEvent.location, geocodeResult.error)
      }
    } catch (error) {
      console.error('Error geocoding location:', error)
    }
  }

  return (
    <>
      {/* Set Redux slots for multi-duration next-slot booking */}
      <NextSlotUpdateUtility multiDurationSlots={multiDurationSlots} />
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Booking Configuration */}
            <div className="space-y-6">
              <div className="xs:p-6 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Duration
                </h3>
                <DurationPicker
                  title={`${DEFAULT_DURATION} minute session - $${DEFAULT_PRICING[DEFAULT_DURATION]}`}
                  duration={DEFAULT_DURATION}
                  price={DEFAULT_PRICING}
                  allowedDurations={ALLOWED_DURATIONS}
                  configuration={null}
                  // multiDurationSlots={multiDurationSlots}
                />
                <Calendar />
                <DynamicTimeList multiDurationSlots={multiDurationSlots} />
                <BookingForm />
              </div>
            </div>
            <div className="space-y-6">
              <div
                id="map-container"
                className="flex h-full min-h-96 w-full items-center justify-center overflow-hidden rounded-lg bg-white p-0 shadow-sm dark:bg-gray-800"
              >
                <MapTile
                  longitude={mapCoordinates.longitude}
                  latitude={mapCoordinates.latitude}
                  zoom={mapCoordinates.zoom}
                />
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <Link
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
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
