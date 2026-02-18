'use client'

import React from 'react'
import { FaCheck } from 'react-icons/fa'
import { AppointmentProps } from '@/lib/types'
import eventSummary from '@/lib/messaging/templates/events/eventSummary'
import eventDescription from '@/lib/messaging/templates/events/eventDescription'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import AttendeeList from './step5/AttendeeList'
import MockCalendarEventJson from './step5/MockCalendarEventJson'

interface Step5EventObjectDetailsProps {
  submittedData: Partial<AppointmentProps> | null
  isConfirmed: boolean
}

function formatDateTime(dateString?: string) {
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

  const clientName = `${submittedData.firstName} ${submittedData.lastName}`
  const summary = eventSummary({
    clientName,
    duration: submittedData.duration || '60',
  })

  const description = eventDescription({
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

  const attendees = [
    {
      email: submittedData.email,
      displayName: clientName,
      responseStatus: 'accepted',
    },
    {
      email: 'trillium@trilliummassage.la',
      displayName: 'Trillium Smith, LMT',
      responseStatus: 'accepted',
      organizer: true,
    },
  ]

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Step 5: Calendar Event Details
      </h2>

      <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <p className="text-sm text-green-800 dark:text-green-200">
          <FaCheck className="mr-1 inline text-green-600" /> This shows the calendar event that
          would be created in Google Calendar using the same backend functions and templates.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Event Title</h3>
          <div className="rounded bg-gray-100 p-3 dark:bg-gray-700">
            <p className="font-medium text-gray-900 dark:text-white">{summary}</p>
          </div>
        </div>

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

        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Location</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {submittedData.location ? flattenLocation(submittedData.location) : 'Not specified'}
          </p>
        </div>

        <AttendeeList attendees={attendees} />

        <div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Event Description
          </h3>
          <div className="rounded bg-gray-100 p-4 dark:bg-gray-700">
            <div
              className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>

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

        <MockCalendarEventJson
          summary={summary}
          description={description}
          submittedData={submittedData}
          attendees={attendees}
        />
      </div>
    </div>
  )
}
