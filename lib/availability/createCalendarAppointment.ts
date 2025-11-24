import type { AppointmentProps } from '../types'
import getAccessToken from 'lib/availability/getAccessToken'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import siteMetadata from '@/data/siteMetadata'

import eventDescription from 'lib/messaging/templates/events/eventDescription'

// Helper function to build the description
function buildDescription(location: string) {
  if (!process.env.OWNER_PHONE_NUMBER) {
    throw new Error(`OWNER_PHONE_NUMBER is not set.`)
  }

  const baseDescription = `Hello, thanks for setting up time!\n\n`
  const phoneDetails = `My phone number is ${process.env.OWNER_PHONE_NUMBER} but please let me know if you’d rather I call you.`
  const meetDetails = `Details for Google Meet are attached; please let me know if that works or if you’d like to meet using a different provider.`
  const closing = `\n\nSee you then!`

  return baseDescription + (location === `phone` ? phoneDetails : meetDetails) + closing
}

// Helper function to build the event body
async function buildEventBody({
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
  customDescription, // Add support for custom description
}: AppointmentProps & { customDescription?: string }) {
  // Use custom description if provided, otherwise generate standard description
  const description =
    customDescription ||
    (await eventDescription({
      start,
      end,
      summary,
      email,
      phone,
      duration,
      location,
      firstName,
      lastName,
      eventBaseString,
      eventMemberString,
      eventContainerString,
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

  console.log('[body]', body)

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
