import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import getTimezoneData from 'lib/timezones'
import { setTimeZone } from '@/redux/slices/availabilitySlice'

const { groupLookupMap, timeZoneMap } = getTimezoneData()

export default function TimezonePicker() {
  const dispatch = useAppDispatch()
  const { timeZone } = useReduxAvailability()

  // In the case we resolve to a timezone that isn’t the representative
  // timezone used in the dropdown box, "snap" the selected timezone to
  // the best candidate invisibly.
  const selectedTimeZoneValue = groupLookupMap.get(timeZone)

  return (
    <div className="flex-grow">
      <label
        htmlFor="location"
        className="block text-sm leading-0 font-medium text-gray-900 dark:text-gray-100"
      >
        Timezone
      </label>

      <select
        value={selectedTimeZoneValue}
        id="location"
        name="location"
        className="focus:ring-primary-400 mt-1 block h-9 w-full overflow-x-clip rounded-md border-0 py-1.5 pr-10 pl-3 leading-6 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 dark:text-gray-100"
        onChange={(e) => {
          dispatch(setTimeZone(e.currentTarget.value))
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
