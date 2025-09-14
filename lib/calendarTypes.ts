import { GoogleCalendarDateTime } from './availabilityTypes'

export type AttendeeType = {
  email: string
  displayName?: string
  organizer?: boolean
  self?: boolean
  responseStatus?: string
}

export type CreatorType = {
  email?: string
  displayName?: string
  self?: boolean
}

export type GoogleCalendarFetchDataReturnType = {
  kind: string
  etag: string
  summary: string
  description: string
  updated: string
  timeZone: string
  accessRole: string
  defaultReminders: { method: string; minutes: number }[]
  items: GoogleCalendarV3Event[]
}

export type GoogleCalendarV3Event = {
  // Define the properties of the event according to Google Calendar API V3
  id: string
  /* The calendar appointment name */
  summary: string
  /* The calendar appointment text */
  description?: string
  start: GoogleCalendarDateTime
  end: GoogleCalendarDateTime
  location?: string
  attendees?: AttendeeType[]
  kind: string
  etag: string
  status: string
  htmlLink: string
  created: string
  updated: string
  creator?: CreatorType
  organizer?: CreatorType
  recurringEventId?: string
  originalStartTime?: object
  iCalUID: string
  sequence: number
  reminders: object
  eventType?: string
}
