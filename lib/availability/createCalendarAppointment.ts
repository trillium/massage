import type { AppointmentProps } from '../types'
import getAccessToken from 'lib/availability/getAccessToken'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import siteMetadata from '@/data/siteMetadata'

import eventDescription from 'lib/messaging/templates/events/eventDescription'

// Helper function to build the event body
async function buildEventBody({
  start,
  end,
  summary,
  email,
  location,
  phone,
  telegramHandle,
  requestId,
  firstName,
  lastName,
  duration,
  eventBaseString,
  eventMemberString,
  eventContainerString,
  additionalNotes,
  edgeMemberType,
  promo,
  bookingUrl,
  slugConfiguration,
  customDescription,
}: AppointmentProps & { customDescription?: string }) {
  const description =
    customDescription ||
    (await eventDescription({
      start,
      end,
      summary,
      email,
      phone,
      telegramHandle,
      duration,
      location,
      firstName,
      lastName,
      eventBaseString,
      eventMemberString,
      eventContainerString,
      additionalNotes,
      edgeMemberType,
      promo,
      bookingUrl,
      slugConfiguration,
    }))

  // For admin-created events, the attendee should be the admin with their correct name
  const isAdminCreated = email === process.env.OWNER_EMAIL
  const attendeeDisplayName = isAdminCreated ? siteMetadata.author || 'Admin' : firstName

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
        displayName: attendeeDisplayName,
        responseStatus: 'accepted',
      },
    ],
    location: flattenLocation(location),
  }
}

export default async function createCalendarAppointment(
  props: AppointmentProps & { customDescription?: string; calendarId?: string }
) {
  const { calendarId = 'primary', ...appointmentProps } = props
  const body = await buildEventBody(appointmentProps)

  const apiUrl = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
  )

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
