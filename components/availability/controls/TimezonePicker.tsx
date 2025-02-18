import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import getTimezoneData from 'lib/timezones'
import { setTimeZone } from '@/redux/slices/availabilitySlice'

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
        className="leading-0 block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        Timezone
      </label>

      <select
        value={selectedTimeZoneValue}
        id="location"
        name="location"
        className="mt-1 block h-9 w-full overflow-x-clip rounded-md border-0 py-1.5 pl-3 pr-10 leading-6 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-400 dark:text-gray-100"
        onChange={(e) => {
          dispatchRedux(setTimeZone(e.currentTarget.value))
        }}
      >
        {[...timeZoneMap].map(([display, { value }]) => (
          <option key={display} value={value}>
            {`GMT${display}`}
          </option>
        ))}
      </select>
    </div>
  )
}
