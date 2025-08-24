import React from 'react'
import { notFound } from 'next/navigation'
import { fetchSingleEvent } from '@/lib/fetch/fetchSingleEvent'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event } from '@/lib/types'
import Link from '@/components/Link'

// Helper function to extract booking slug from event data
function extractBookingSlug(event: GoogleCalendarV3Event): string | null {
  // Check description for eventBaseString patterns that might contain booking slug
  const description = event.description || ''

  // Look for eventBaseString pattern which is constructed from booking slug
  // Pattern: {bookingSlug}{eventBaseString} like "hotel-june__EVENT__"
  const eventStringMatch = description.match(/([a-z0-9-]+)__EVENT__/)
  if (eventStringMatch) {
    return eventStringMatch[1]
  }

  // Look for other patterns that might indicate booking slug
  const summaryLower = (event.summary || '').toLowerCase()
  if (summaryLower.includes('hotel june') || summaryLower.includes('hotel-june')) {
    return 'hotel-june'
  }

  // Check for playa vista indicators
  if (summaryLower.includes('playa') || description.toLowerCase().includes('playa')) {
    return 'playa-vista'
  }

  // Check for free 30 indicators
  if (
    summaryLower.includes('free') &&
    (summaryLower.includes('30') || summaryLower.includes('thirty'))
  ) {
    return 'free-30'
  }

  return null
}

// Helper function to create booking URL with location parameters
function createBookingUrl(bookingSlug: string | null, location?: string): string {
  const baseUrl = bookingSlug ? `/${bookingSlug}` : '/'

  if (!location) {
    return baseUrl
  }

  // Extract city and zip from location string if possible
  const params = new URLSearchParams()

  // Try to parse location string for common patterns
  // Example: "Hotel June West LA, 8639 Lincoln Blvd, Los Angeles, CA 90045"
  // Example: "123 Main St, Los Angeles, CA 90210"
  const cityMatch = location.match(/,\s*([^,]+),\s*[A-Z]{2}\s*(\d{5})/i)
  if (cityMatch) {
    const city = cityMatch[1].trim()
    const zip = cityMatch[2]
    params.set('city', city)
    params.set('zip', zip)
  } else {
    // If we can't parse it cleanly, try to extract city from common patterns
    const simpleCityMatch = location.match(/,\s*([^,\d]+)/i)
    if (simpleCityMatch) {
      params.set('city', simpleCityMatch[1].trim())
    }
  }

  // Extract street address (everything before first comma)
  const streetMatch = location.match(/^([^,]+)/)
  if (streetMatch) {
    params.set('street', streetMatch[1].trim())
  }

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

export default async function EventPage({ params }: { params: Promise<{ event_id: string }> }) {
  const { event_id } = await params

  // Fetch the specific calendar event
  const matchingEvent = await fetchSingleEvent(event_id)

  // Extract booking slug and create booking URL if event exists
  let bookingSlug: string | null = null
  let bookingUrl: string = '/book'

  if (matchingEvent) {
    bookingSlug = extractBookingSlug(matchingEvent)
    bookingUrl = createBookingUrl(bookingSlug, matchingEvent.location)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Calendar Event Details</h1>

        {matchingEvent ? (
          <>
            <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                {matchingEvent.summary || 'Untitled Event'}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Event ID:
                  </h3>
                  <p className="rounded bg-gray-100 p-2 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-white">
                    {matchingEvent.id}
                  </p>
                </div>

                {matchingEvent.description && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Description:
                    </h3>
                    <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                      {matchingEvent.description}
                    </p>
                  </div>
                )}

                {(matchingEvent.start?.dateTime || matchingEvent.start?.date) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Start Time:
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {matchingEvent.start.dateTime
                        ? new Date(matchingEvent.start.dateTime).toLocaleString()
                        : matchingEvent.start.date}
                    </p>
                  </div>
                )}

                {(matchingEvent.end?.dateTime || matchingEvent.end?.date) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      End Time:
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {matchingEvent.end.dateTime
                        ? new Date(matchingEvent.end.dateTime).toLocaleString()
                        : matchingEvent.end.date}
                    </p>
                  </div>
                )}

                {matchingEvent.location && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Location:
                    </h3>
                    <p className="text-gray-900 dark:text-white">{matchingEvent.location}</p>
                  </div>
                )}

                {matchingEvent.creator && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Created by:
                    </h3>
                    <p className="text-gray-900 dark:text-white">
                      {matchingEvent.creator.displayName || matchingEvent.creator.email}
                    </p>
                  </div>
                )}

                {matchingEvent.attendees && matchingEvent.attendees.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Attendees:
                    </h3>
                    <ul className="list-inside list-disc text-gray-900 dark:text-white">
                      {matchingEvent.attendees.map((attendee, index) => (
                        <li key={index}>
                          {attendee.displayName || attendee.email}
                          {attendee.responseStatus && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({attendee.responseStatus})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matchingEvent.status && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </h3>
                    <p className="text-gray-900 capitalize dark:text-white">
                      {matchingEvent.status}
                    </p>
                  </div>
                )}

                {matchingEvent.htmlLink && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      Google Calendar Link:
                    </h3>
                    <Link
                      href={matchingEvent.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Open in Google Calendar
                    </Link>{' '}
                  </div>
                )}

                {/* Booking URL Section */}
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Book a Similar Session:
                  </h3>
                  <div className="mt-2 space-y-2">
                    {bookingSlug && (
                      <p className="text-sm text-green-700 dark:text-green-300">
                        <strong>Detected Booking Type:</strong>{' '}
                        <span className="font-mono text-xs">{bookingSlug}</span>
                      </p>
                    )}
                    <Link
                      href={bookingUrl}
                      className="inline-block rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      Book New Appointment
                    </Link>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {matchingEvent.location &&
                        'Location information will be pre-filled based on this event'}
                    </p>
                  </div>
                </div>

                {/* Book Next Slot Section */}
                <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">
                    Book the Next Available Slot After This Event:
                  </h3>
                  <div className="mt-2">
                    <Link
                      href={`/event/${matchingEvent.id}/next`}
                      className="inline-block rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      Book Next Slot
                    </Link>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Only times within 30 minutes after this event will be shown.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mb-8 rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <h2 className="mb-4 text-2xl font-semibold text-red-800 dark:text-red-200">
              Event Not Found
            </h2>
            <p className="text-red-700 dark:text-red-300">
              No event found with ID: <span className="font-mono text-sm">{event_id}</span>
            </p>
            <p className="mt-2 text-red-600 dark:text-red-400">
              Check the search results below for available events.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
