import React from 'react'
import { notFound } from 'next/navigation'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event } from '@/lib/types'
import { fetchSingleEvent } from 'lib/fetch/fetchSingleEvent'

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
  const baseUrl = bookingSlug ? `/${bookingSlug}` : '/book'

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
  console.log('[EventPage] params:', params)
  const { event_id } = await params
  console.log('[EventPage] event_id:', event_id)

  // Fetch the specific calendar event
  const matchingEvent = await fetchSingleEvent(event_id)
  console.log('matchingEvent:', matchingEvent)

  // Extract booking slug and create booking URL if event exists
  let bookingSlug: string | null = null
  let bookingUrl: string = '/book'

  if (matchingEvent) {
    bookingSlug = extractBookingSlug(matchingEvent)
    bookingUrl = createBookingUrl(bookingSlug, matchingEvent.location)
    console.log('[EventPage] Extracted booking slug:', bookingSlug)
    console.log('[EventPage] Generated booking URL:', bookingUrl)
  }

  // Also search for events containing 'massage'
  let massageEvents: GoogleCalendarV3Event[] = []
  try {
    // Create date range: 6 months ago to 6 months in the future
    const eighteenMonthsAgo = new Date()
    eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18)

    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

    console.log('Search date range:', {
      start: eighteenMonthsAgo.toISOString(),
      end: sixMonthsFromNow.toISOString(),
    })

    massageEvents = await getEventsBySearchQuery({
      query: 'massage',
      start: eighteenMonthsAgo,
      end: sixMonthsFromNow,
    })
    console.log('massageEvents:', massageEvents)
  } catch (error) {
    console.error('Error fetching massage events:', error)
  }

  // Log whether we found the specific event or not
  if (!matchingEvent) {
    console.log(`No event found with ID: ${event_id}, but showing page with search results`)
  } else {
    // Log the matching event for debugging
    console.log('[EventPage] Matching event found:', JSON.stringify(matchingEvent, null, 2))
    console.log('[EventPage] matchingEvent.start:', matchingEvent.start)
    console.log('[EventPage] matchingEvent.end:', matchingEvent.end)
    console.log('[EventPage] matchingEvent.creator:', matchingEvent.creator)
    console.log('[EventPage] matchingEvent.attendees:', matchingEvent.attendees)
    console.log('[EventPage] matchingEvent.status:', matchingEvent.status)
    console.log('[EventPage] matchingEvent.htmlLink:', matchingEvent.htmlLink)
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
                    <a
                      href={matchingEvent.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Open in Google Calendar
                    </a>
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
                    <a
                      href={bookingUrl}
                      className="inline-block rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      Book New Appointment
                    </a>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {matchingEvent.location &&
                        'Location information will be pre-filled based on this event'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug section showing raw JSON */}
            <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-900">
              <h3 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                Raw Event Data (Debug):
              </h3>
              <pre className="overflow-auto text-xs text-gray-900 dark:text-white">
                {JSON.stringify(matchingEvent, null, 2)}
              </pre>
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

        {/* Search Results for 'massage' */}
        <div className="mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Events containing "massage"
          </h2>
          {massageEvents.length > 0 ? (
            <div className="space-y-4">
              {massageEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {event.summary || 'Untitled Event'}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>ID:</strong> <span className="font-mono text-xs">{event.id}</span>
                    </p>
                    {(event.start?.dateTime || event.start?.date) && (
                      <p>
                        <strong>Start:</strong>{' '}
                        {event.start.dateTime
                          ? new Date(event.start.dateTime).toLocaleString()
                          : event.start.date}
                      </p>
                    )}
                    {(event.end?.dateTime || event.end?.date) && (
                      <p>
                        <strong>End:</strong>{' '}
                        {event.end.dateTime
                          ? new Date(event.end.dateTime).toLocaleString()
                          : event.end.date}
                      </p>
                    )}
                    {event.location && (
                      <p>
                        <strong>Location:</strong> {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p>
                        <strong>Description:</strong>{' '}
                        {event.description.length > 100
                          ? `${event.description.substring(0, 100)}...`
                          : event.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-3">
                    <a
                      href={`/event/${event.id}`}
                      className="inline-block rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No events found containing "massage"</p>
          )}
        </div>
      </div>
    </div>
  )
}
