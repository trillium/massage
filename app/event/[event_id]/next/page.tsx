import { DynamicTimeList } from '@/components/availability/DynamicTimeList'
import {
  SearchParamsType,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
} from '@/lib/types'
import Calendar from '@/components/availability/date/Calendar'
import BookingForm from '@/components/booking/BookingForm'
import { format } from 'date-fns'
import { DEFAULT_PRICING, ALLOWED_DURATIONS, DEFAULT_DURATION } from 'config'
import Link from '@/components/Link'
import MapTile from '@/components/MapTile'
import { geocodeLocation } from '@/lib/geocode'
import { IMAGE_CONFIG } from '@/lib/mapConfig'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import InitializeBookingState from '@/components/booking/InitializeBookingState'
import DurationSlotManager from '@/components/booking/DurationSlotManager'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'

interface NextBookingPageProps {
  params: Promise<{ event_id: string }>
  searchParams: Promise<SearchParamsType>
}

export default async function NextBookingPage({ params, searchParams }: NextBookingPageProps) {
  const { event_id } = await params
  const resolvedSearchParams = await searchParams

  // Use the configuration system with 'next' type
  const overrides = {
    type: 'next' as const,
    bookingSlug: 'next',
    title: 'Book Next Available Slot',
    text: null,
    location: null,
    eventContainer: null,
    pricing: DEFAULT_PRICING,
    discount: null,
    leadTimeMinimum: null,
    instantConfirm: true,
    acceptingPayment: true,
    allowedDurations: ALLOWED_DURATIONS,
  }

  const result = await createPageConfiguration({
    resolvedParams: resolvedSearchParams,
    overrides,
    eventId: event_id,
  })

  // Access the properties from the result (specific to 'next' configuration type)
  const resultWithNextData = result as typeof result & {
    multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
    currentEvent?: GoogleCalendarV3Event
  }
  const multiDurationSlots = resultWithNextData.multiDurationSlots || {}
  const currentEvent = resultWithNextData.currentEvent
  const selectedDate = result.selectedDate || undefined
  const selectedDuration = result.duration
  const configuration = result.configuration

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
  const eventEndTimeStr = eventEndTime ? eventEndTime.toLocaleString() : 'Unknown'

  // Geocode the event location to get coordinates for the map
  const mapCoordinates = {
    longitude: -118.2437, // Default Los Angeles coordinates
    latitude: 34.0522,
    zoom: IMAGE_CONFIG.zoom,
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

  // Get slots for the selected duration to pass to Redux initialization
  const selectedDurationSlots = multiDurationSlots[selectedDuration] || []

  return (
    <>
      {/* Initialize Redux state with server-generated data */}
      <InitializeBookingState
        slots={selectedDurationSlots}
        duration={selectedDuration}
        selectedDate={selectedDate}
      />
      {/* Manage slot updates when duration changes */}
      <DurationSlotManager multiDurationSlots={multiDurationSlots} />
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
                  title={`${selectedDuration} minute session - $${DEFAULT_PRICING[selectedDuration]}`}
                  duration={selectedDuration}
                  price={DEFAULT_PRICING}
                  allowedDurations={ALLOWED_DURATIONS}
                  configuration={null}
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
