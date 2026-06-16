'use client'

import React from 'react'
import { FaCheck } from 'react-icons/fa'
import { AppointmentProps } from '@/lib/types'
import eventSummary from '@/lib/messaging/templates/events/eventSummary'
import eventDescription from '@/lib/messaging/templates/events/eventDescription'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import AttendeeList from './step5/AttendeeList'
import MockCalendarEventJson from './step5/MockCalendarEventJson'
import { H2, H3, H4 } from '@/components/ui/heading'
import { TextSm, TextSmMuted, TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

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
      <div className="mb-8 rounded-lg bg-surface-50 p-6 shadow-lg dark:bg-surface-800">
        <H2 className="mb-4 dark:text-white">Step 5: Calendar Event Details</H2>
        <TextBase className="text-accent-600 dark:text-accent-400">
          {!submittedData
            ? 'Complete the booking form to see calendar event details.'
            : 'Waiting for therapist approval to generate calendar event...'}
        </TextBase>
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
    <div className="mb-8 rounded-lg bg-surface-50 p-6 shadow-lg dark:bg-surface-800">
      <H2 className="mb-6 dark:text-white">Step 5: Calendar Event Details</H2>

      <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <TextSm status="success">
          <FaCheck className="mr-1 inline text-green-600" /> This shows the calendar event that
          would be created in Google Calendar using the same backend functions and templates.
        </TextSm>
      </div>

      <div className="space-y-6">
        <Box>
          <H3 className="mb-2 dark:text-white">Event Title</H3>
          <div className="rounded bg-surface-200 p-3 dark:bg-surface-700">
            <TextBase className="font-medium text-accent-900 dark:text-white">{summary}</TextBase>
          </div>
        </Box>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Box>
            <H3 className="mb-2 dark:text-white">Start Time</H3>
            <TextBase className="text-accent-700 dark:text-accent-300">
              {formatDateTime(submittedData.start)}
            </TextBase>
          </Box>
          <Box>
            <H3 className="mb-2 dark:text-white">End Time</H3>
            <TextBase className="text-accent-700 dark:text-accent-300">
              {formatDateTime(submittedData.end)}
            </TextBase>
          </Box>
        </div>

        <Box>
          <H3 className="mb-2 dark:text-white">Location</H3>
          <TextBase className="text-accent-700 dark:text-accent-300">
            {submittedData.location ? flattenLocation(submittedData.location) : 'Not specified'}
          </TextBase>
        </Box>

        <AttendeeList attendees={attendees} />

        <Box>
          <H3 className="mb-2 dark:text-white">Event Description</H3>
          <div className="rounded bg-surface-200 p-4 dark:bg-surface-700">
            <div
              className="text-sm whitespace-pre-wrap text-accent-700 dark:text-accent-300"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </Box>

        <Box>
          <H3 className="mb-2 dark:text-white">Event Metadata</H3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Box>
              <H4 className="dark:text-white">Event Base String</H4>
              <TextSmMuted className="font-mono">
                {submittedData.eventBaseString || 'N/A'}
              </TextSmMuted>
            </Box>
            {submittedData.eventMemberString && (
              <Box>
                <H4 className="dark:text-white">Event Member String</H4>
                <TextSmMuted className="font-mono">{submittedData.eventMemberString}</TextSmMuted>
              </Box>
            )}
            {submittedData.bookingUrl && (
              <Box>
                <H4 className="dark:text-white">Booking URL</H4>
                <TextSmMuted className="font-mono">{submittedData.bookingUrl}</TextSmMuted>
              </Box>
            )}
            {submittedData.promo && (
              <Box>
                <H4 className="dark:text-white">Promo Applied</H4>
                <TextSmMuted className="font-mono">{submittedData.promo}</TextSmMuted>
              </Box>
            )}
          </div>
        </Box>

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
