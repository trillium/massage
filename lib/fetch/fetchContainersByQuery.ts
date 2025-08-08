import Day from 'lib/day'
import { getEventsBySearchQuery } from '../availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event, SearchParamsType } from 'lib/types'
import { loadData } from 'lib/dataLoading'

/**
 * Fetches all events containing "__EVENT__" in their title or description.
 * This is the most efficient approach for getting all container/member events in a single API call.
 */
export async function fetchContainerGeneric({ searchParams }: { searchParams: SearchParamsType }) {
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(21)
  const startDate = new Date(start.toString())
  const endDate = new Date(end.toString())

  const allEvents = await getEventsBySearchQuery({
    start: startDate,
    end: endDate,
    query: '__EVENT__', // Generic query to get all event container/member events
  })

  return {
    start: start.toString(),
    end: end.toString(),
    allEvents,
  }
}

/**
 * Fetches ALL calendar events (both __EVENT__ and regular calendar events).
 * Use this when blockingScope is 'general' to block against all calendar events.
 */
export async function fetchAllCalendarEvents({ searchParams }: { searchParams: SearchParamsType }) {
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(21)
  const startDate = new Date(start.toString())
  const endDate = new Date(end.toString())

  // First, get all __EVENT__ events
  const eventBasedEvents = await getEventsBySearchQuery({
    start: startDate,
    end: endDate,
    query: '__EVENT__',
  })

  // Then, we need to get ALL calendar events (including regular events)
  // This might require a different approach depending on your calendar API
  // For now, we'll simulate by getting events with a very broad query or empty query
  const allCalendarEvents = await getEventsBySearchQuery({
    start: startDate,
    end: endDate,
    query: '', // Empty query should return all events
  })

  return {
    start: start.toString(),
    end: end.toString(),
    allEvents: allCalendarEvents, // This includes both __EVENT__ and regular events
  }
}

/**
 * Filters events locally for a specific query configuration.
 * Use this with fetchContainerGeneric results to avoid multiple API calls.
 */
export function filterEventsForQuery(allEvents: GoogleCalendarV3Event[], query: string) {
  const searchQuery = query + '__EVENT__'
  const eventMemberString = query + '__EVENT__MEMBER__'
  const eventContainerString = query + '__EVENT__CONTAINER__'

  // Filter events that match this specific query
  const events = allEvents.filter((e: GoogleCalendarV3Event) => {
    return e.summary.includes(searchQuery) || (e.description && e.description.includes(searchQuery))
  })

  const members = events.filter((e: GoogleCalendarV3Event) => {
    return (
      e.summary.includes(eventMemberString) ||
      (e.description && e.description.includes(eventMemberString))
    )
  })

  const containers = events.filter((e: GoogleCalendarV3Event) => {
    return (
      e.summary.includes(eventContainerString) ||
      (e.description && e.description.includes(eventContainerString))
    )
  })

  const busyQuery = members.map((e: GoogleCalendarV3Event) => {
    return { start: e.start, end: e.end }
  })

  return {
    events,
    members,
    containers,
    busyQuery,
    searchQuery,
    eventMemberString,
    eventContainerString,
  }
}

/**
 * Filters all events for general availability blocking.
 * This blocks ALL events - both __EVENT__ bookings AND regular calendar events.
 */
export function filterEventsForGeneralBlocking(allEvents: GoogleCalendarV3Event[]) {
  // Handle case where allEvents is undefined or null
  if (!allEvents || !Array.isArray(allEvents)) {
    return {
      busyQuery: [],
      eventMembers: [],
      regularEvents: [],
      allBlockingEvents: [],
    }
  }

  // All events that contain __EVENT__MEMBER__ (event-based bookings)
  const eventMembers = allEvents.filter((e: GoogleCalendarV3Event) => {
    return (
      e.summary.includes('__EVENT__MEMBER__') ||
      (e.description && e.description.includes('__EVENT__MEMBER__'))
    )
  })

  // All events that DON'T contain __EVENT__ (regular calendar events)
  const regularEvents = allEvents.filter((e: GoogleCalendarV3Event) => {
    return !(
      e.summary.includes('__EVENT__') ||
      (e.description && e.description.includes('__EVENT__'))
    )
  })

  // Combine both types for blocking
  const allBlockingEvents = [...eventMembers, ...regularEvents]

  const busyQuery = allBlockingEvents.map((e: GoogleCalendarV3Event) => {
    return { start: e.start, end: e.end }
  })

  return {
    events: allEvents, // All events for reference
    members: eventMembers, // Event-based bookings
    regularEvents: regularEvents, // Regular calendar events
    blockingEvents: allBlockingEvents, // Combined blocking events
    busyQuery,
  }
}

/**
 * Fetches containers for a specific query by making a targeted API call.
 * Use this when you only need events for a single configuration.
 */
export async function fetchContainerSpecific({
  query,
}: {
  searchParams: SearchParamsType
  query: string
}) {
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(21)
  const startDate = new Date(start.toString())
  const endDate = new Date(end.toString())

  const searchQuery = query + '__EVENT__'
  const eventMemberString = query + '__EVENT__MEMBER__'
  const eventContainerString = query + '__EVENT__CONTAINER__'

  const events = await getEventsBySearchQuery({
    start: startDate,
    end: endDate,
    query: searchQuery,
  })

  const members = events.filter((e: GoogleCalendarV3Event) => {
    return (
      e.summary.includes(eventMemberString) ||
      (e.description && e.description.includes(eventMemberString))
    )
  })

  const busyQuery = members.map((e: GoogleCalendarV3Event) => {
    return { start: e.start, end: e.end }
  })

  const containers = events.filter((e: GoogleCalendarV3Event) => {
    return (
      e.summary.includes(eventContainerString) ||
      (e.description && e.description.includes(eventContainerString))
    )
  })

  return {
    start: start.toString(),
    end: end.toString(),
    busy: busyQuery,
    containers: containers,
  }
}

/**
 * @deprecated Use fetchContainerGeneric or fetchContainerSpecific instead
 * Legacy function maintained for backward compatibility
 */
export async function fetchContainersByQuery({
  query,
}: {
  searchParams: SearchParamsType
  query: string
}) {
  return fetchContainerSpecific({ query, searchParams: {} })
}
