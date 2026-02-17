import {
  GoogleCalendarV3Event,
  StringInterval,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'

export type MockedData = {
  start: string
  end: string
  busy: Array<{ start: Date; end: Date }>
  timeZone?: string
  data?: Record<string, unknown>
}

export type FetchPageDataReturnType = {
  start: string
  end: string
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  timeZone?: string
  data?: Record<string, unknown>
  multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
  currentEvent?: GoogleCalendarV3Event
  eventCoordinates?: { latitude: number; longitude: number }
  nextEventFound: boolean
  targetDate?: string
  debugInfo?: {
    pathTaken: string
    inputs: Record<string, unknown>
    outputs: Record<string, unknown>
  }
}
