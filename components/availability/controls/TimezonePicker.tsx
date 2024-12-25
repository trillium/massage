import { useAppDispatch, useReduxAvailability } from "@/app/hooks"
import getTimezoneData from "@/lib/timezones"
import { setTimeZone } from "@/redux/slices/availabilitySlice"

const { groupLookupMap, timeZoneMap } = getTimezoneData()

export default function TimezonePicker() {
  const dispatchRedux = useAppDispatch()
  const { timeZone } = useReduxAvailability()

  // In the case we resolve to a timezone that isn’t the representative
  // timezone used in the dropdown box, "snap" the selected timezone to
  // the best candidate invisibly.
  const selectedTimeZoneValue = groupLookupMap.get(timeZone)

  return (
    <div className="flex-grow">
      <label
        htmlFor="location"
        className="block text-sm font-medium leading-0 text-gray-900 dark:text-gray-100">
        Timezone
      </label>

      <select
        value={selectedTimeZoneValue}
        id="location"
        name="location"
        className="mt-1 block w-full h-9 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-400 leading-6 overflow-x-clip"
        onChange={(e) => {
          dispatchRedux(setTimeZone(e.currentTarget.value))
        }}>
        {[...timeZoneMap].map(([display, { value }]) => (
          <option key={display} value={value}>
            {`GMT${display}`}
          </option>
        ))}
      </select>
    </div>
  )
}
