'use client'

import React from 'react'
import { AppointmentProps } from '@/lib/types'
import templates from '@/lib/messageTemplates/templates'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

interface Step5EventObjectDetailsProps {
  submittedData: Partial<AppointmentProps> | null
  isConfirmed: boolean
}

export default function Step5EventObjectDetails({
  submittedData,
  isConfirmed,
}: Step5EventObjectDetailsProps) {
  if (!submittedData || !isConfirmed) {
    return (
      <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Step 5: Calendar Event Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {!submittedData
            ? 'Complete the booking form to see calendar event details.'
            : 'Waiting for therapist approval to generate calendar event...'}
        </p>
      </div>
    )
  }

  // Create mock event summary and description using backend templates
  const clientName = `${submittedData.firstName} ${submittedData.lastName}`
  const eventSummary = templates.eventSummary({
    clientName,
    duration: submittedData.duration || '60',
  })

  const eventDescription = templates.eventDescription({
    start: submittedData.start,
    end: submittedData.end,
    phone: submittedData.phone,
    duration: submittedData.duration,
    email: submittedData.email,
    location: submittedData.location,
    firstName: submittedData.firstName,
    lastName: submittedData.lastName,
    eventBaseString: submittedData.eventBaseString,
    eventMemberString: submittedData.eventMemberString,
    eventContainerString: submittedData.eventContainerString,
    bookingUrl: submittedData.bookingUrl,
    promo: submittedData.promo,
  })

  // Mock attendees list
  const attendees = [
    {
      email: submittedData.email,
      displayName: clientName,
      responseStatus: 'accepted',
    },
    {
      email: 'trillium@trilliummassage.la', // Mock therapist email
      displayName: 'Trillium Smith, LMT',
      responseStatus: 'accepted',
      organizer: true,
    },
  ]

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Step 5: Calendar Event Details
      </h2>

      <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <p className="text-sm text-green-800 dark:text-green-200">
          ✅ This shows the calendar event that would be created in Google Calendar using the same
          backend functions and templates.
        </p>
      </div>

      <div className="space-y-6">
        {/* Event Summary */}
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Event Title</h3>
          <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
            <p className="font-medium text-gray-900 dark:text-white">{eventSummary}</p>
          </div>
        </div>

        {/* Event Times */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Start Time</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {formatDateTime(submittedData.start)}
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">End Time</h3>
            <p className="text-gray-700 dark:text-gray-300">{formatDateTime(submittedData.end)}</p>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Location</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {submittedData.location ? flattenLocation(submittedData.location) : 'Not specified'}
          </p>
        </div>

        {/* Attendees */}
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Attendees</h3>
          <div className="space-y-2">
            {attendees.map((attendee, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded bg-gray-100 p-3 dark:bg-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {attendee.displayName}
                    {attendee.organizer && (
                      <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Organizer
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{attendee.email}</p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    attendee.responseStatus === 'accepted'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {attendee.responseStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Event Description */}
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Event Description
          </h3>
          <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
            <div
              className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: eventDescription }}
            />
          </div>
        </div>

        {/* Event Metadata */}
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Event Metadata
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Event Base String</h4>
              <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                {submittedData.eventBaseString || 'N/A'}
              </p>
            </div>
            {submittedData.eventMemberString && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Event Member String</h4>
                <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {submittedData.eventMemberString}
                </p>
              </div>
            )}
            {submittedData.bookingUrl && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Booking URL</h4>
                <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {submittedData.bookingUrl}
                </p>
              </div>
            )}
            {submittedData.promo && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Promo Applied</h4>
                <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {submittedData.promo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mock Calendar Event JSON */}
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Mock Calendar Event Object
          </h3>
          <details className="rounded bg-gray-100 dark:bg-gray-700">
            <summary className="cursor-pointer p-3 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600">
              View Raw Event Data (Click to expand)
            </summary>
            <pre className="overflow-auto p-3 text-xs text-gray-600 dark:text-gray-400">
              {JSON.stringify(
                {
                  id: `mock_event_${Date.now()}`,
                  summary: eventSummary,
                  description: eventDescription,
                  start: {
                    dateTime: submittedData.start,
                    timeZone: submittedData.timeZone,
                  },
                  end: {
                    dateTime: submittedData.end,
                    timeZone: submittedData.timeZone,
                  },
                  location: submittedData.location
                    ? flattenLocation(submittedData.location)
                    : undefined,
                  attendees: attendees,
                  creator: {
                    email: 'trillium@trilliummassage.la',
                    displayName: 'Trillium Smith, LMT',
                  },
                  organizer: {
                    email: 'trillium@trilliummassage.la',
                    displayName: 'Trillium Smith, LMT',
                  },
                  status: 'confirmed',
                  kind: 'calendar#event',
                  etag: `"mock_etag_${Date.now()}"`,
                  htmlLink: `https://calendar.google.com/calendar/event?eid=mock_${Date.now()}`,
                  created: new Date().toISOString(),
                  updated: new Date().toISOString(),
                  iCalUID: `mock_${Date.now()}@google.com`,
                  sequence: 0,
                  reminders: {
                    useDefault: true,
                  },
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
