import fs from 'fs'
import path from 'path'
import type {
  GoogleCalendarV3Event,
  StringInterval,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'

type CapturedDataType = {
  timestamp: string
  environment: string
  endpoint?: string
  params?: Record<string, unknown>
  response: unknown
}

type FetchPageDataCapture = {
  configuration: Record<string, unknown>
  resolvedParams: Record<string, unknown>
  bookingSlug?: string
  eventId?: string
  result: {
    start: string
    end: string
    busy: StringInterval[]
    containers?: GoogleCalendarV3Event[]
    multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
    currentEvent?: GoogleCalendarV3Event
    eventCoordinates?: { latitude: number; longitude: number }
    nextEventFound: boolean
    targetDate?: string
  }
}

/**
 * Captures API response data and saves it to a JSON file for testing
 */
export async function captureTestData(
  identifier: string,
  data: unknown,
  metadata?: {
    endpoint?: string
    params?: Record<string, unknown>
    environment?: string
  }
): Promise<string> {
  const timestamp = new Date().toISOString()
  const environment = metadata?.environment || process.env.NODE_ENV || 'development'

  // Create filename with timestamp and identifier
  const filename = `${identifier}_${timestamp.replace(/[:.]/g, '-')}.json`
  const filepath = path.join(process.cwd(), 'test-data', 'api-responses', filename)

  const capturedData: CapturedDataType = {
    timestamp,
    environment,
    endpoint: metadata?.endpoint,
    params: metadata?.params,
    response: data,
  }

  // Ensure directory exists
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Write the JSON file with pretty formatting
  fs.writeFileSync(filepath, JSON.stringify(capturedData, null, 2))

  return filepath
}

/**
 * Captures data from fetchPageData specifically
 */
export async function captureFetchPageData(captureData: FetchPageDataCapture): Promise<string> {
  return captureTestData('fetchPageData', captureData, {
    endpoint: 'fetchPageData',
    params: {
      bookingSlug: captureData.bookingSlug,
      eventId: captureData.eventId,
      configurationType: captureData.configuration?.type,
    },
  })
}

/**
 * Captures raw Google Calendar API responses
 */
export async function captureCalendarResponse(
  apiName: 'events' | 'freeBusy' | 'singleEvent',
  response: unknown,
  params?: Record<string, unknown>
): Promise<string> {
  return captureTestData(`calendar-${apiName}`, response, {
    endpoint: `calendar.${apiName}`,
    params,
  })
}

/**
 * Loads captured test data from file
 */
export function loadCapturedData<T = unknown>(filename: string): T {
  const filepath = path.join(process.cwd(), 'test-data', 'api-responses', filename)

  if (!fs.existsSync(filepath)) {
    throw new Error(`Test data file not found: ${filepath}`)
  }

  const fileContent = fs.readFileSync(filepath, 'utf-8')
  const capturedData = JSON.parse(fileContent) as CapturedDataType

  return capturedData.response as T
}

/**
 * Lists all captured test data files
 */
export function listCapturedData(): string[] {
  const dir = path.join(process.cwd(), 'test-data', 'api-responses')

  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir).filter((file) => file.endsWith('.json'))
}
