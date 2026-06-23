import type { AppointmentProps, ChairAppointmentBlockCalendarProps } from '../types'
import getAccessToken from '@/lib/availability/getAccessToken'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

import onsiteEventDescription from 'lib/messaging/templates/events/onsiteEventDescription'

// Helper function to build the event body
function buildEventBody(props: ChairAppointmentBlockCalendarProps) {
  const {
    start,
    end,
    summary,
    email,
    location,
    phone,
    requestId,
    firstName,
    lastName,
    duration,
    eventBaseString,
    eventMemberString,
    eventContainerString,
  } = props
  const description = onsiteEventDescription(props)

  return {
    start: {
      dateTime: start,
    },
    end: {
      dateTime: end,
    },
    summary,
    description,
    attendees: [
      {
        email,
        displayName: firstName,
      },
    ],
    ...{
      location: flattenLocation(location),
      city: typeof location === 'string' ? '' : location.city,
      zipCode: typeof location === 'string' ? '' : location.zip,
    },
  }
}

export default async function createOnsiteAppointment(props: ChairAppointmentBlockCalendarProps) {
  const body = buildEventBody(props)

  const apiUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')

  apiUrl.searchParams.set('sendNotifications', 'true')
  apiUrl.searchParams.set('conferenceDataVersion', '1')

  return fetch(apiUrl, {
    cache: 'no-cache',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(body),
  })
}
