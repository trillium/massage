import getBusyTimes from 'lib/availability/getBusyTimes'
import { getDateRangeInterval, mapDatesToStrings } from 'lib/availability/helpers'
import Day from 'lib/day'
import { SearchParamsType } from '../types'

export async function fetchData({ searchParams }: { searchParams: SearchParamsType }) {
  // Offer two weeks of availability.
  const start = Day.todayWithOffset(0)
  const end = Day.todayWithOffset(14)

  const timeZone = undefined

  const busy = await getBusyTimes(
    getDateRangeInterval({
      start,
      end,
      timeZone,
    })
  )

  return {
    start: start.toString(),
    end: end.toString(),
    busy: mapDatesToStrings(busy),
  }
}
