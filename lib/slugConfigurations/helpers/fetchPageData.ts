import { SearchParamsType, SlugConfigurationType } from '@/lib/types'
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
) {
  if (mocked) {
    // Use mocked data instead of fetching
    return {
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

    return {
      start: containerData.start,
      end: containerData.end,
      busy: busyConverted,
      containers: containerData.containers,
    }
  }

  const regularData = await fetchData({ searchParams: resolvedParams })
  return {
    ...regularData,
    containers: [], // Ensure containers property exists
  }
}
