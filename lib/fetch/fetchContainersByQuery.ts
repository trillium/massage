import Day from 'lib/day'
import { getEventsBySearchQuery } from '../availability/getEventsBySearchQuery'
import { GoogleCalendarV3Event, SearchParamsType } from 'lib/types'
import { loadData } from 'lib/dataLoading'

export async function fetchContainersByQuery({
  query,
}: {
  searchParams: SearchParamsType
  query: string
}) {
  // Offer three weeks of availability predefined event based container availability.
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(21)

  const startDate = new Date(Day.todayWithOffset(0).toString())
  const endDate = new Date(Day.todayWithOffset(21).toString())

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
  const containersMapped = containers.map((e: GoogleCalendarV3Event) => {
    let obj = {}
    try {
      if (e.description) {
        obj = loadData(e.description)
      }
    } catch (error) {
      console.error('loadData error')
      console.error(error)
      console.error(e.description)
    }

    return {
      ...obj,
      start: e.start,
      end: e.end,
      location: e.location,
    }
  })

  return {
    start: start.toString(),
    end: end.toString(),
    busy: busyQuery,
    containers: containersMapped,
  }
}
