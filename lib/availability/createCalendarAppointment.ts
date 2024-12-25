import type { AppointmentProps } from "../types"
import getAccessToken from "@/lib/availability/getAccessToken"

import templates from "@/lib/messageTemplates/templates"

// Helper function to build the description
function buildDescription(location: string) {
  if (!process.env.OWNER_PHONE_NUMBER) {
    throw new Error(`OWNER_PHONE_NUMBER is not set.`)
  }

  const baseDescription = `Hello, thanks for setting up time!\n\n`
  const phoneDetails = `My phone number is ${process.env.OWNER_PHONE_NUMBER} but please let me know if you’d rather I call you.`
  const meetDetails = `Details for Google Meet are attached; please let me know if that works or if you’d like to meet using a different provider.`
  const closing = `\n\nSee you then!`

  return (
    baseDescription +
    (location === `phone` ? phoneDetails : meetDetails) +
    closing
  )
}

// Helper function to build the event body
function buildEventBody({
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
}: AppointmentProps) {
  const description = templates.eventDescription({
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
  })

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
    ...{ location },
  }
}

export default async function createCalendarAppointment(
  props: AppointmentProps
) {
  const body = buildEventBody(props)

  const apiUrl = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  )

  apiUrl.searchParams.set("sendNotifications", "true")
  apiUrl.searchParams.set("conferenceDataVersion", "1")

  return fetch(apiUrl, {
    cache: "no-cache",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body: JSON.stringify(body),
  })
}
