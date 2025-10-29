import Template from '@/components/Template'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import SectionContainer from '@/components/SectionContainer'
import CachedTileMap from '@/components/CachedTileMap'
import DriveTimeCalculator from '@/components/booking/features/DriveTimeCalculator'
import { DEFAULT_VIEW } from '@/lib/mapConfig'
import { buildDurationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'
import {
  SlugConfigurationType,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
  DayWithStartEnd,
} from '@/lib/types'

interface NextBookingFeatureProps {
  durationProps: ReturnType<typeof buildDurationProps>
  configuration: SlugConfigurationType | null
  selectedDate: string | null
  slots: StringDateTimeIntervalAndLocation[]
  duration: number
  data: {
    start: string
    end: string
    busy: StringDateTimeIntervalAndLocation[]
    containers?: GoogleCalendarV3Event[]
    multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
    currentEvent?: GoogleCalendarV3Event
    eventCoordinates?: { latitude: number; longitude: number }
    nextEventFound?: boolean
    targetDate?: string
  }
  start: DayWithStartEnd
  end: DayWithStartEnd
}

export default function NextBookingFeature({
  durationProps,
  configuration,
  selectedDate,
  slots,
  duration,
  data,
  start,
  end,
}: NextBookingFeatureProps) {
  const foundNextEvent = data?.nextEventFound ?? false
  const currentEvent = data?.currentEvent || null

  const locationProps = {
    latitude: data.eventCoordinates?.latitude ?? DEFAULT_VIEW.latitude,
    longitude: data.eventCoordinates?.longitude ?? DEFAULT_VIEW.longitude,
    zoom: data.eventCoordinates ? 12 : DEFAULT_VIEW.zoom,
    style: { width: '100%', height: '400px' },
    showMarker: data.eventCoordinates ? true : false,
  }

  return (
    <SectionContainer>
      <NextBookingHeader
        foundNextEvent={foundNextEvent}
        currentEvent={currentEvent}
        targetDate={data.targetDate}
      />

      <div className="mb-8 flex flex-col gap-6 overflow-hidden rounded-lg bg-gray-100 shadow-lg dark:bg-gray-950">
        <CachedTileMap {...locationProps} />
        {currentEvent && <DriveTimeCalculator currentEvent={currentEvent} />}
      </div>

      <BookingForm />
      <div className="flex flex-col space-y-8">
        <DurationPicker {...durationProps} />
        <Calendar weeksDisplayOverride={1} />
        <TimeList />
      </div>

      <InitialUrlUtility
        configObject={configuration}
        initialSlots={slots}
        initialSelectedDate={selectedDate || undefined}
        initialDuration={duration}
      />
      <UpdateSlotsUtility busy={data.busy} start={start} end={end} configObject={configuration} />
    </SectionContainer>
  )
}

interface NextBookingHeaderProps {
  foundNextEvent: boolean
  currentEvent: GoogleCalendarV3Event | null
  targetDate?: string
}

function NextBookingHeader({ foundNextEvent, currentEvent, targetDate }: NextBookingHeaderProps) {
  let displayTitle: string
  let displayText: string

  if (foundNextEvent) {
    const locationArea = extractLocationArea(currentEvent?.location)
    const endTime = formatEventTime(currentEvent?.end?.dateTime)

    displayTitle = `Book After Current Session`
    displayText = `Finishing a session ${locationArea} at ${endTime}`
  } else {
    const today = new Date().toISOString().split('T')[0]
    const isShowingToday = targetDate === today
    const timeLabel = isShowingToday ? 'Today' : 'Tomorrow'

    displayTitle = `Book Next Available - ${timeLabel}`
    displayText = `Book your next available appointment ${isShowingToday ? 'today' : 'tomorrow'}.`
  }

  return <Template title={displayTitle} text={displayText} />
}

function extractLocationArea(location?: string): string {
  if (!location) return 'in the LA area'

  const zipMatch = location.match(/\b\d{5}\b/)
  if (zipMatch) return `in ${zipMatch[0]}`

  const cityMatch = location.match(/,\s*([^,]+),\s*[A-Z]{2}/)
  if (cityMatch) return `in ${cityMatch[1].trim()}`

  const parts = location.split(',').map((p) => p.trim())
  if (parts.length >= 2) return `in ${parts[parts.length - 2]}`

  return 'in the LA area'
}

function formatEventTime(dateTime?: string): string {
  if (!dateTime) return 'soon'

  const date = new Date(dateTime)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}
