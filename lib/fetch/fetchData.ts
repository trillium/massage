import getBusyTimes from 'lib/availability/getBusyTimes'
import { getDateRangeInterval, mapDatesToStrings } from 'lib/availability/helpers'
import Day from 'lib/day'
import getAccessToken from 'lib/availability/getAccessToken'
import {
  SearchParamsType,
  GoogleCalendarFetchDataReturnType,
  GoogleCalendarV3Event,
} from '../types'

export async function fetchData({ searchParams }: { searchParams: SearchParamsType }) {
  // Offer two weeks of availability.
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(14)

  const timeZone = undefined

  const dateRangeInterval = getDateRangeInterval({
    start,
    end,
    timeZone,
  })

  const busy = await getBusyTimes(dateRangeInterval)

  const mappedBusy = mapDatesToStrings(busy)

  return {
    start: start.toString(),
    end: end.toString(),
    busy: mappedBusy,
  }
}
