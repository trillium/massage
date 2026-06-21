'use client'

import { useSmartRefresh } from 'hooks/useSmartRefresh'
import {
  ConfigurationUtility,
  InitializationUtility,
  SlotGenerationUtility,
  UrlSynchronizationUtility,
  type NextSlotMultiDurationsType,
} from '@/components/utilities/BookingUtilities'
import {
  DayWithStartEnd,
  GoogleCalendarV3Event,
  SlugConfigurationType,
  StringInterval,
  StringDateTimeIntervalAndLocation,
} from '@/lib/types'

export {
  ConfigurationUtility,
  InitializationUtility,
  SlotGenerationUtility,
  UrlSynchronizationUtility,
}

export function UpdateSlotsUtility(props: {
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  start: DayWithStartEnd
  end: DayWithStartEnd
  configObject: SlugConfigurationType | null
  initialSelectedDate?: string
}) {
  useSmartRefresh()
  return (
    <>
      <ConfigurationUtility configObject={props.configObject} />
      <SlotGenerationUtility
        busy={props.busy}
        containers={props.containers}
        start={props.start}
        end={props.end}
        shouldAutoSelectFirstDate={true}
        initialSelectedDate={props.initialSelectedDate}
      />
      <UrlSynchronizationUtility />
    </>
  )
}

export function NextSlotUpdateUtility(props: {
  busy: StringInterval[]
  containers?: GoogleCalendarV3Event[]
  start: DayWithStartEnd
  end: DayWithStartEnd
  configObject: SlugConfigurationType | null
  nextSlotMultiDurations: NextSlotMultiDurationsType
}) {
  useSmartRefresh()
  return (
    <>
      <ConfigurationUtility configObject={props.configObject} />
      <SlotGenerationUtility
        busy={props.busy}
        containers={props.containers}
        nextSlotMultiDurations={props.nextSlotMultiDurations}
        isNextSlotPage={true}
        shouldAutoSelectFirstDate={true}
      />
    </>
  )
}

export function InitialUrlUtility(props: {
  configObject: SlugConfigurationType | null
  initialSlots: StringDateTimeIntervalAndLocation[]
  initialSelectedDate?: string
  initialDuration?: number
}) {
  return (
    <>
      <ConfigurationUtility configObject={props.configObject} />
      <InitializationUtility
        initialSlots={props.initialSlots}
        initialSelectedDate={props.initialSelectedDate}
        initialDuration={props.initialDuration}
      />
    </>
  )
}

export function UrlUpdateUtility() {
  return <UrlSynchronizationUtility />
}
