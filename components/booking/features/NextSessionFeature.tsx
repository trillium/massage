import Template from '@/components/Template'
import BookingForm from '@/components/booking/BookingForm'
import SlotTakenAlert from '@/components/booking/SlotTakenAlert'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import SectionContainer from '@/components/SectionContainer'
import { SlotHoldProvider } from 'hooks/SlotHoldContext'
import ConnectedRoleField from '@/components/booking/fields/ConnectedRoleField'
import EdgeRoleHydrator from '@/components/utilities/EdgeRoleHydrator'
import { buildDurationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'
import { home } from '@/app/content'
import { H2 } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'
import {
  SlugConfigurationType,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
  DayWithStartEnd,
} from '@/lib/types'

interface NextSessionFeatureProps {
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
  startTimeLabel: string
  bookingEndPoint?: string
}

export default function NextSessionFeature({
  durationProps,
  configuration,
  selectedDate,
  slots,
  duration,
  data,
  start,
  end,
  startTimeLabel,
  bookingEndPoint,
}: NextSessionFeatureProps) {
  const showRoleField = !!configuration.customFields?.showRoleField

  return (
    <SectionContainer>
      <SlotTakenAlert />
      <Template
        title={configuration.title || home.bookingTitle || 'Book a session'}
        text={configuration.text ?? undefined}
        links={configuration.links}
      />
      <SlotHoldProvider>
        <BookingForm
          acceptingPayment={configuration.acceptingPayment ?? true}
          endPoint={bookingEndPoint}
        />

        <Stack direction="col" gap={8}>
          <H2>{`Next slot: ${startTimeLabel}`}</H2>
          <DurationPicker {...durationProps} />
          {showRoleField && <ConnectedRoleField />}
          <TimeList />
        </Stack>
      </SlotHoldProvider>

      {showRoleField && <EdgeRoleHydrator />}
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
