import { useReduxAvailability } from '@/redux/hooks'
import TimeButton from './TimeButton'
import type { DateTimeIntervalAndLocation } from '@/lib/types'
import { formatDatetimeToString } from '@/lib/helpers'

type TimeListProps = {
  availability: DateTimeIntervalAndLocation[]
}
export default function TimeList({ availability }: TimeListProps) {
  const { selectedTime, timeZone } = useReduxAvailability()

  const timeSignature = (selectedTime?.start ?? '') + (selectedTime?.end ?? '')

  return (
    <div className="grid grid-cols-2 gap-2">
      {availability?.map(({ start, end, location }) => {
        const isActive = selectedTime
          ? formatDatetimeToString(start) + formatDatetimeToString(end) === timeSignature
          : false

        return (
          <TimeButton
            key={start.toISOString() + end.toISOString()}
            active={isActive}
            time={{ start, end }}
            location={location}
          />
        )
      })}
    </div>
  )
}
