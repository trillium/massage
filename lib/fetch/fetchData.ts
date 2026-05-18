import getBusyTimes from 'lib/availability/getBusyTimes'
import { getDateRangeInterval, mapDatesToStrings } from 'lib/availability/helpers'
import Day from 'lib/day'
import getAccessToken from 'lib/availability/getAccessToken'
import {
  SearchParamsType,
  GoogleCalendarFetchDataReturnType,
  GoogleCalendarV3Event,
} from '../types'

const DEFAULT_WINDOW_DAYS = 14

export async function fetchData({
  searchParams,
  windowDays,
}: {
  searchParams: SearchParamsType
  windowDays?: number
}) {
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(windowDays ?? DEFAULT_WINDOW_DAYS)

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
