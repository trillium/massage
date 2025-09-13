import Template from '@/components/Template'
import BookingForm from '@/components/booking/BookingForm'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import SectionContainer from '@/components/SectionContainer'
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
  // Check if the configuration system found a next event or fell back to general availability
  const foundNextEvent = data?.nextEventFound ?? false
  const currentEvent = data?.currentEvent || null

  let displayTitle: string
  let displayText: string

  if (foundNextEvent) {
    displayTitle = `Book After Current Event: ${currentEvent?.summary || 'Untitled Event'}`
    displayText = `Book your next appointment after: ${currentEvent?.summary || 'Untitled Event'}`
  } else {
    // Determine if we're showing today or tomorrow based on the targetDate from fetchPageData
    const today = new Date().toISOString().split('T')[0]
    const isShowingToday = data.targetDate === today
    const timeLabel = isShowingToday ? 'Today' : 'Tomorrow'

    displayTitle = `Book Next Available - ${timeLabel}`
    displayText = `Book your next available appointment ${isShowingToday ? 'today' : 'tomorrow'}.`
  }

  return (
    <SectionContainer>
      <Template title={displayTitle} text={displayText} />
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
