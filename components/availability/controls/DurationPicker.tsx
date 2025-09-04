'use client'

import clsx from 'clsx'

import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING } from 'config'
import { setDuration } from '@/redux/slices/availabilitySlice'
import { useAppDispatch, useReduxAvailability, useReduxConfig } from '@/redux/hooks'
import { GeneratePrice } from '@/components/ui/atoms/GeneratePriceAtom'
import { durationPropsType } from '@/lib/slugConfigurations/helpers/buildDurationProps'

export default function DurationPicker({
  allowedDurations: allowedDurationsProps,
  price: priceProps,
  duration: durationProps,
  configuration,
}: durationPropsType) {
  const { price: priceRedux, allowedDurations: allowedDurationsRedux } = useReduxConfig()
  const { duration: durationRedux } = useReduxAvailability()
  const dispatchRedux = useAppDispatch()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchRedux(setDuration(Number(event.target.value)))
  }

  const duration = durationRedux || durationProps || DEFAULT_DURATION
  const allowedDurations = allowedDurationsRedux || allowedDurationsProps || ALLOWED_DURATIONS
  const price = priceRedux || priceProps || DEFAULT_PRICING
  const sessionCost = price[duration || DEFAULT_DURATION] ?? ''

  return (
    <fieldset>
      <legend className="block pb-2 text-sm leading-0 font-medium text-gray-900 dark:text-gray-100">
        {/* {`${duration || 90} minute session - $${sessionCost}`} */}
        <span>{`${duration || 90} minute session`} </span>
        <GeneratePrice price={sessionCost} discount={configuration?.discount} />
      </legend>
      <div className="focus-within:ring-primary-500 active:ring-primary-500 isolate mt-1 inline-flex h-9 rounded-md shadow-sm focus-within:ring-2 active:ring-2">
        {allowedDurations.map((theDuration, i) => (
          <div key={theDuration} className="flex items-center rounded-r-md">
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
                'outline-primary-600 relative inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:z-10',
                {
                  'rounded-l-md': i === 0,
                  'rounded-r-md': i === allowedDurations.length - 1,
                  '-ml-px': i > 0,
                  'bg-white text-gray-900 ring-gray-300 hover:bg-gray-200':
                    theDuration !== duration,
                  'bg-primary-500 shadow-primary-900 ring-primary-400 text-white shadow-inner':
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
