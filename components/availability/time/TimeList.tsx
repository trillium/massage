import TimeButton from "./TimeButton"
import type { DateTimeIntervalAndLocation } from "@/lib/types"

type TimeListProps = {
  availability: DateTimeIntervalAndLocation[]
}
export default function TimeList({ availability }: TimeListProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {availability?.map(({ start, end, location }) => (
        <TimeButton
          key={start.toISOString() + end.toISOString()}
          time={{ start, end }}
          location={location}
        />
      ))}
    </div>
  )
}
