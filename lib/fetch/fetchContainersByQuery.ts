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
