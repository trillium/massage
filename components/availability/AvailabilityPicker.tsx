import dynamic from "next/dynamic"

import DurationPicker, { durationProps } from "./controls/DurationPicker"
import TimezonePicker from "./controls/TimezonePicker"
import type { DateTimeIntervalAndLocation } from "@/lib/types"
import format from "date-fns-tz/format"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

// Load these dynamically, without SSR, to avoid hydration issues
// that arise with timezone differences.
const Calendar = dynamic(() => import("./date/Calendar"), { ssr: false })
const TimeList = dynamic(() => import("./time/TimeList"), { ssr: false })

export type PickerProps = {
  durationProps: durationProps
  tzPickerProps?: {
    showPicker: boolean
  }
}

export default function AvailabilityPicker({
  slots,
  pickerProps,
  children
}: {
  slots: DateTimeIntervalAndLocation[]
  pickerProps: PickerProps
  children: React.ReactNode
}) {
  const { durationProps } = pickerProps
  const { showPicker } = pickerProps.tzPickerProps || { showPicker: true }
  const { selectedDate, timeZone } = useSelector(
    (state: RootState) => state.availability
  )

  let maximumAvailability = 0
  const availabilityByDate = slots.reduce<
    Record<string, DateTimeIntervalAndLocation[]>
  >((acc, slot) => {
    // Gives us the same YYYY-MM-DD format as Day.toString()
    const date = format(slot.start, "yyyy-MM-dd", { timeZone })

    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(slot)

    if (acc[date].length > maximumAvailability) {
      maximumAvailability = acc[date].length
    }
    return acc
  }, {})

  const availability = selectedDate
    ? availabilityByDate[selectedDate.toString()]
    : []

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex space-x-6">
        <DurationPicker {...durationProps} />
        {showPicker && <TimezonePicker />}
      </div>
      {children}
      <Calendar
        offers={availabilityByDate}
        maximumAvailability={maximumAvailability}
      />
      <TimeList availability={availability} />
    </div>
  )
}
