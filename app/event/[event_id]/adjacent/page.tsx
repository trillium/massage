import { DynamicTimeList } from '@/components/availability/DynamicTimeList'
import {
  SearchParamsType,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
} from '@/lib/types'
import Calendar from '@/components/availability/date/Calendar'
import BookingForm from '@/components/booking/BookingForm'
import SlotTakenAlert from '@/components/booking/SlotTakenAlert'
import { format } from 'date-fns'
import { DEFAULT_PRICING, ALLOWED_DURATIONS, DEFAULT_DURATION } from 'config'
import Link from '@/components/Link'
import MapTile from '@/components/MapTile'
import { geocodeLocation } from '@/lib/geocode'
import { IMAGE_CONFIG } from '@/lib/mapConfig'
import { SlotHoldProvider } from 'hooks/SlotHoldContext'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import InitializeBookingState from '@/components/booking/InitializeBookingState'
import DurationSlotManager from '@/components/booking/DurationSlotManager'
import { createPageConfiguration } from '@/lib/slugConfigurations/createPageConfiguration'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextXs } from '@/components/ui/text'

interface AdjacentBookingPageProps {
  params: Promise<{ event_id: string }>
  searchParams: Promise<SearchParamsType>
}

export default async function AdjacentBookingPage({
  params,
  searchParams,
}: AdjacentBookingPageProps) {
  const { event_id } = await params
  const resolvedSearchParams = await searchParams

  const overrides = {
    type: 'adjacent' as const,
    bookingSlug: 'adjacent',
    title: 'Book Adjacent Slot',
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

  const resultWithAdjacentData = result as typeof result & {
    multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
    currentEvent?: GoogleCalendarV3Event
  }
  const multiDurationSlots = resultWithAdjacentData.multiDurationSlots || {}
  const currentEvent = resultWithAdjacentData.currentEvent
  const selectedDate = result.selectedDate || undefined
  const selectedDuration = result.duration
  const configuration = result.configuration

  if (!currentEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <H2 className="mb-4" status="error">
              Error Loading Event
            </H2>
            <p className="text-red-700 dark:text-red-300">Event not found</p>
          </div>
        </div>
      </div>
    )
  }

  const eventStartTime = currentEvent.start?.dateTime ? new Date(currentEvent.start.dateTime) : null
  const eventEndTime = currentEvent.end?.dateTime ? new Date(currentEvent.end.dateTime) : null
  const eventStartTimeStr = eventStartTime ? eventStartTime.toLocaleString() : 'Unknown'
  const eventEndTimeStr = eventEndTime ? eventEndTime.toLocaleString() : 'Unknown'

  const mapCoordinates = {
    longitude: -118.2437,
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

  const selectedDurationSlots = multiDurationSlots[selectedDuration] || []

  return (
    <>
      <InitializeBookingState
        slots={selectedDurationSlots}
        duration={selectedDuration}
        selectedDate={selectedDate}
      />
      <DurationSlotManager multiDurationSlots={multiDurationSlots} />
      <SlotTakenAlert />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <H1 className="mb-4 dark:text-white">Book Adjacent Slot</H1>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <H2 className="mb-2 dark:text-white">
                Current Event: {currentEvent.summary || 'Untitled Event'}
              </H2>
              <div className="space-y-1 text-sm text-accent-600 dark:text-accent-400">
                <p>
                  <strong>Event starts at:</strong> {eventStartTimeStr}
                </p>
                <p>
                  <strong>Event ends at:</strong> {eventEndTimeStr}
                </p>
                {currentEvent.location && (
                  <p>
                    <strong>Location:</strong> {currentEvent.location}
                  </p>
                )}
                <TextXs className="mt-2">
                  Available slots are shown before and after this event with a 30-minute buffer.
                </TextXs>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="xs:p-6 rounded-lg bg-surface-50 p-3 shadow-sm dark:bg-surface-800">
                <H3 className="mb-4 dark:text-white">Duration</H3>
                <SlotHoldProvider>
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
                </SlotHoldProvider>
              </div>
            </div>
            <div className="space-y-6">
              <div
                id="map-container"
                className="flex h-full min-h-96 w-full items-center justify-center overflow-hidden rounded-lg bg-surface-50 p-0 shadow-sm dark:bg-surface-800"
              >
                <MapTile
                  longitude={mapCoordinates.longitude}
                  latitude={mapCoordinates.latitude}
                  zoom={mapCoordinates.zoom}
                />
              </div>
            </div>
          </div>

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
