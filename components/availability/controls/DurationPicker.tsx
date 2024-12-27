import clsx from 'clsx'

import { ALLOWED_DURATIONS as DEFAULT_ALLOWED_DURATIONS } from 'config'
import { setDuration } from '@/redux/slices/availabilitySlice'
import { useAppDispatch, useReduxAvailability } from 'app/hooks'

export type durationProps = {
  title: string
  allowedDurations?: number[]
}

export default function DurationPicker({ title, allowedDurations }: durationProps) {
  const ALLOWED_DURATIONS = allowedDurations || DEFAULT_ALLOWED_DURATIONS
  const { duration } = useReduxAvailability()
  const dispatchRedux = useAppDispatch()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchRedux(setDuration(Number(event.target.value)))
  }

  return (
    <fieldset>
      <legend className="leading-0 block text-sm font-medium text-gray-900 dark:text-gray-100">
        {title || 'Duration'}
      </legend>
      <div className="isolate mt-1 inline-flex h-9 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-primary-500 active:ring-2 active:ring-primary-500">
        {ALLOWED_DURATIONS.map((theDuration, i) => (
          <div key={theDuration} className="flex items-center">
            <input
              id={`duration-${theDuration}`}
              name="duration"
              type="radio"
              value={theDuration}
              checked={duration === theDuration}
              onChange={handleChange}
              className="sr-only"
            />
            <label
              htmlFor={`duration-${theDuration}`}
              className={clsx(
                'relative inline-flex items-center px-3 py-2 text-sm font-semibold outline-primary-600 ring-1 ring-inset focus:z-10',
                {
                  'rounded-l-md': i === 0,
                  'rounded-r-md': i === ALLOWED_DURATIONS.length - 1,
                  '-ml-px': i > 0,
                  'bg-white text-gray-900 ring-gray-300 hover:bg-gray-200':
                    theDuration !== duration,
                  'bg-primary-500 text-white shadow-inner shadow-primary-900 ring-primary-400':
                    theDuration === duration,
                }
              )}
            >
              {theDuration}m
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
