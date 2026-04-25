import Template from '@/components/Template'
import BookingForm from '@/components/booking/BookingForm'
import SlotTakenAlert from '@/components/booking/SlotTakenAlert'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import SectionContainer from '@/components/SectionContainer'
import { SlotHoldProvider } from 'hooks/SlotHoldContext'
import { buildDurationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'
import { siteConfig } from '@/lib/siteConfig'
import {
  SlugConfigurationType,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
  DayWithStartEnd,
} from '@/lib/types'

interface GeneralBookingFeatureProps {
  durationProps: ReturnType<typeof buildDurationProps>
  configuration: SlugConfigurationType
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
  bookingEndPoint?: string
}

export default function GeneralBookingFeature({
  durationProps,
  configuration,
  selectedDate,
  slots,
  duration,
  data,
  start,
  end,
  bookingEndPoint,
}: GeneralBookingFeatureProps) {
  return (
    <SectionContainer>
      <SlotTakenAlert />
      <Template
        title={configuration.title || siteConfig.content.bookingTitle || 'Book a session'}
        text={configuration.text ?? undefined}
        links={configuration.links}
      />
      <SlotHoldProvider>
        <BookingForm
          acceptingPayment={configuration.acceptingPayment ?? true}
          endPoint={bookingEndPoint}
        />

        <div className="flex flex-col space-y-8">
          <DurationPicker {...durationProps} />
          {!configuration.hideCalendar && <Calendar />}
          <TimeList />
        </div>
      </SlotHoldProvider>

      <InitialUrlUtility
        configObject={configuration}
        initialSlots={slots}
        initialSelectedDate={selectedDate || undefined}
        initialDuration={duration}
      />
      <UpdateSlotsUtility
        busy={data.busy}
        containers={data.containers}
        start={start}
        end={end}
        configObject={configuration}
      />
    </SectionContainer>
  )
}
