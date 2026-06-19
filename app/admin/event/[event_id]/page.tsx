/* ds-ignore-file */
import React from 'react'
import { notFound } from 'next/navigation'
import { getEventsBySearchQuery } from '@/lib/availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event } from '@/lib/types'
import { fetchSingleEvent } from 'lib/fetch/fetchSingleEvent'
import Link from '@/components/Link'
import { H1, H2, H3 } from '@/components/ui/heading'
import { TextSm, TextSmMuted, TextXs, TextXsMuted, TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

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

  // Also search for events containing 'massage'
  let massageEvents: GoogleCalendarV3Event[] = []
  try {
    // Create date range: 6 months ago to 6 months in the future
    const eighteenMonthsAgo = new Date()
    eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18)

    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
    massageEvents = await getEventsBySearchQuery({
      query: 'massage',
      start: eighteenMonthsAgo,
      end: sixMonthsFromNow,
    })
  } catch (error) {
    console.error('Error fetching massage events:', error)
  }

  return (
    <Box className="container mx-auto px-4 py-8">
      <Box className="mx-auto max-w-4xl">
        <H1 className="mb-6">{'Calendar Event Details'}</H1>

        {matchingEvent ? (
          <>
            <Box className="mb-8 rounded-lg bg-surface-50 p-6 shadow-lg dark:bg-surface-800">
              <H2 className="mb-4 dark:text-white">{matchingEvent.summary || 'Untitled Event'}</H2>

              <Box className="space-y-4">
                <Box>
                  <H3>{'Event ID:'}</H3>
                  <TextSm className="rounded bg-surface-200 p-2 font-mono dark:bg-surface-700 dark:text-white">
                    {matchingEvent.id}
                  </TextSm>
                </Box>

                {matchingEvent.description && (
                  <Box>
                    <H3>{'Description:'}</H3>
                    <TextBase className="whitespace-pre-wrap text-accent-900 dark:text-white">
                      {matchingEvent.description}
                    </TextBase>
                  </Box>
                )}

                {(matchingEvent.start?.dateTime || matchingEvent.start?.date) && (
                  <Box>
                    <H3>{'Start Time:'}</H3>
                    <TextBase className="text-accent-900 dark:text-white">
                      {matchingEvent.start.dateTime
                        ? new Date(matchingEvent.start.dateTime).toLocaleString()
                        : matchingEvent.start.date}
                    </TextBase>
                  </Box>
                )}

                {(matchingEvent.end?.dateTime || matchingEvent.end?.date) && (
                  <Box>
                    <H3>{'End Time:'}</H3>
                    <TextBase className="text-accent-900 dark:text-white">
                      {matchingEvent.end.dateTime
                        ? new Date(matchingEvent.end.dateTime).toLocaleString()
                        : matchingEvent.end.date}
                    </TextBase>
                  </Box>
                )}

                {matchingEvent.location && (
                  <Box>
                    <H3>{'Location:'}</H3>
                    <TextBase className="text-accent-900 dark:text-white">
                      {matchingEvent.location}
                    </TextBase>
                  </Box>
                )}

                {matchingEvent.creator && (
                  <Box>
                    <H3>{'Created by:'}</H3>
                    <TextBase className="text-accent-900 dark:text-white">
                      {matchingEvent.creator.displayName || matchingEvent.creator.email}
                    </TextBase>
                  </Box>
                )}

                {matchingEvent.attendees && matchingEvent.attendees.length > 0 && (
                  <Box>
                    <H3>{'Attendees:'}</H3>
                    <ul className="list-inside list-disc text-accent-900 dark:text-white">
                      {matchingEvent.attendees.map((attendee, index) => (
                        <li key={index}>
                          {attendee.displayName || attendee.email}
                          {attendee.responseStatus && (
                            <TextSmMuted>
                              {'('}
                              {attendee.responseStatus}
                              {')'}
                            </TextSmMuted>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}

                {matchingEvent.status && (
                  <Box>
                    <H3>{'Status:'}</H3>
                    <TextBase className="text-accent-900 capitalize dark:text-white">
                      {matchingEvent.status}
                    </TextBase>
                  </Box>
                )}

                {matchingEvent.htmlLink && (
                  <Box>
                    <H3>{'Google Calendar Link:'}</H3>
                    <Link
                      href={matchingEvent.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {'Open in Google Calendar'}
                    </Link>
                  </Box>
                )}

                {/* Booking URL Section */}
                <Box className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <H3>{'Book a Similar Session:'}</H3>
                  <Box className="mt-2 space-y-2">
                    {bookingSlug && (
                      <TextSm status="success">
                        <strong>{'Detected Booking Type:'}</strong>{' '}
                        <TextXs className="font-mono">{bookingSlug}</TextXs>
                      </TextSm>
                    )}
                    <Link
                      href={bookingUrl}
                      className="inline-block rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      {'Book New Appointment'}
                    </Link>
                    <TextXsMuted>
                      {matchingEvent.location &&
                        'Location information will be pre-filled based on this event'}
                    </TextXsMuted>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Debug section showing raw JSON */}
            <Box className="rounded-lg bg-surface-200 p-6 dark:bg-surface-900">
              <H3 className="mb-4">{'Raw Event Data (Debug):'}</H3>
              <pre className="overflow-auto text-xs text-accent-900 dark:text-white">
                {JSON.stringify(matchingEvent, null, 2)}
              </pre>
            </Box>
          </>
        ) : (
          <Box className="mb-8 rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
            <H2 className="mb-4" status="error">
              {'Event Not Found'}
            </H2>
            <TextBase className="text-red-700 dark:text-red-300">
              {'No event found with ID: '}
              <TextSm className="font-mono">{event_id}</TextSm>
            </TextBase>
            <TextBase className="mt-2 text-red-600 dark:text-red-400">
              {'Check the search results below for available events.'}
            </TextBase>
          </Box>
        )}

        {/* Search Results for 'massage' */}
        <Box className="mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <H2 className="mb-6 dark:text-white">{'Events containing "massage"'}</H2>
          {massageEvents.length > 0 ? (
            <Box className="space-y-4">
              {massageEvents.map((event, index) => (
                <Box
                  key={event.id || index}
                  className="rounded-lg bg-surface-50 p-4 shadow-sm dark:bg-surface-800"
                >
                  <H3 className="dark:text-white">{event.summary || 'Untitled Event'}</H3>
                  <Box className="mt-2 space-y-1 text-sm text-accent-600 dark:text-accent-400">
                    <TextBase>
                      <strong>{'ID:'}</strong> <TextXs className="font-mono">{event.id}</TextXs>
                    </TextBase>
                    {(event.start?.dateTime || event.start?.date) && (
                      <TextBase>
                        <strong>{'Start:'}</strong>{' '}
                        {event.start.dateTime
                          ? new Date(event.start.dateTime).toLocaleString()
                          : event.start.date}
                      </TextBase>
                    )}
                    {(event.end?.dateTime || event.end?.date) && (
                      <TextBase>
                        <strong>{'End:'}</strong>{' '}
                        {event.end.dateTime
                          ? new Date(event.end.dateTime).toLocaleString()
                          : event.end.date}
                      </TextBase>
                    )}
                    {event.location && (
                      <TextBase>
                        <strong>{'Location:'}</strong> {event.location}
                      </TextBase>
                    )}
                    {event.description && (
                      <TextBase>
                        <strong>{'Description:'}</strong>{' '}
                        {event.description.length > 100
                          ? `${event.description.substring(0, 100)}...`
                          : event.description}
                      </TextBase>
                    )}
                  </Box>
                  <Box className="mt-3">
                    <Link
                      href={`/event/${event.id}`}
                      className="inline-block rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      {'View Details'}
                    </Link>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <TextBase status="secondary">{'No events found containing "massage"'}</TextBase>
          )}
        </Box>
      </Box>
    </Box>
  )
}
