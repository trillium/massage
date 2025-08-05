import {
  GoogleCalendarV3Event,
  SearchParamsType,
  SlugConfigurationType,
  StringInterval,
} from '@/lib/types'
import { fetchContainersByQuery } from '@/lib/fetch/fetchContainersByQuery'
import { fetchData } from '@/lib/fetch/fetchData'

type MockedData = {
  start: string
  end: string
  busy: Array<{ start: Date; end: Date }>
  timeZone?: string
  data?: Record<string, unknown>
}

/**
 * Fetches data based on configuration type and mocking requirements
 */
export async function fetchPageData(
  configuration: SlugConfigurationType,
  resolvedParams: SearchParamsType,
  bookingSlug?: string,
  mocked?: MockedData | null
): Promise<{
  start: string
  end: string
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  timeZone?: string
  data?: Record<string, unknown>
}> {
  // If configuration type is null, this is an invalid/non-existent slug
  if (configuration?.type === null) {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD format
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    return {
      start: todayStr,
      end: yesterdayStr, // End before start = invalid range, no availability
      busy: [],
    }
  }

  if (mocked) {
    // Use mocked data instead of fetching
    const result = {
      start: mocked.start,
      end: mocked.end,
      busy: mocked.busy.map((busyItem) => ({
        start: busyItem.start.toISOString(),
        end: busyItem.end.toISOString(),
      })),
      timeZone: mocked.timeZone,
      data: mocked.data || {},
      containers: [], // Ensure containers property exists
    }
    return result
  }

  if (configuration?.type === 'scheduled-site' && !!bookingSlug) {
    const containerData = await fetchContainersByQuery({
      searchParams: resolvedParams,
      query: bookingSlug,
    })

    // Convert busy times to the expected string format
    const busyConverted = containerData.busy.map((busyItem) => ({
      start: typeof busyItem.start === 'string' ? busyItem.start : busyItem.start.dateTime,
      end: typeof busyItem.end === 'string' ? busyItem.end : busyItem.end.dateTime,
    }))

    const result = {
      start: containerData.start,
      end: containerData.end,
      busy: busyConverted,
      containers: containerData.containers,
    }
    return result
  }

  if (configuration?.type === 'fixed-location') {
    // Fixed-location bookings use regular data fetching and OWNER_AVAILABILITY
    const regularData = await fetchData({ searchParams: resolvedParams })
    // Don't include containers - this will use OWNER_AVAILABILITY in getPotentialTimes
    const result = {
      start: regularData.start,
      end: regularData.end,
      busy: regularData.busy,
    }
    return result
  }

  // Default case: area-wide or null type configurations
  const regularData = await fetchData({ searchParams: resolvedParams })
  // Don't include containers - this will use OWNER_AVAILABILITY in getPotentialTimes
  const result = {
    start: regularData.start,
    end: regularData.end,
    busy: regularData.busy,
  }
  return result
}
