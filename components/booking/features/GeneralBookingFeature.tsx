import Image from 'next/image'
import Template from '@/components/Template'
import BookingForm from '@/components/booking/BookingForm'
import SlotTakenAlert from '@/components/booking/SlotTakenAlert'
import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import TimeList from '@/components/availability/time/TimeList'
import { InitialUrlUtility, UpdateSlotsUtility } from '@/components/utilities/UpdateSlotsUtility'
import SectionContainer from '@/components/SectionContainer'
import { SlotHoldProvider } from 'hooks/SlotHoldContext'
import ConnectedRoleField from '@/components/booking/fields/ConnectedRoleField'
import EdgeRoleHydrator from '@/components/utilities/EdgeRoleHydrator'
import NextSlotCard from '@/components/booking/features/NextSlotCard'
import { buildDurationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'
import { home } from '@/app/content'
import { differenceInDays, parseISO } from 'date-fns'
import { dayToString } from '@/lib/dayAsObject'
import {
  SlugConfigurationType,
  StringDateTimeIntervalAndLocation,
  GoogleCalendarV3Event,
  DayWithStartEnd,
} from '@/lib/types'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

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
  const showRoleField = !!configuration.customFields?.showRoleField
  const forceRole = configuration.customFields?.forceRole
  const showHydrator = showRoleField || !!forceRole

  return (
    <SectionContainer>
      <SlotTakenAlert />
      {configuration.heroImage && (
        <Box className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-lg">
          <Image
            src={configuration.heroImage.src}
            alt={configuration.heroImage.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </Box>
      )}
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

        <Stack className="space-y-8" direction="col">
          <Stack direction="col" gap={4} className="md:flex-row md:items-stretch">
            <Box className="md:flex-1">
              <DurationPicker {...durationProps} />
            </Box>
            {configuration.showNextSlotCard && (
              <Box className="md:flex-1">
                <NextSlotCard />
              </Box>
            )}
          </Stack>
          {showRoleField && <ConnectedRoleField />}
          {!configuration.hideCalendar && (
            <Calendar
              paginate={
                !!configuration.promoEndDate &&
                differenceInDays(parseISO(configuration.promoEndDate), new Date()) > 14
              }
              start={dayToString(start)}
              end={dayToString(end)}
            />
          )}
          <TimeList />
        </Stack>
      </SlotHoldProvider>

      {showHydrator && <EdgeRoleHydrator forceRole={forceRole} />}
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
