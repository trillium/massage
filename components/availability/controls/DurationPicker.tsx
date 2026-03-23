'use client'

import clsx from 'clsx'

import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING } from 'config'
import { setDuration } from '@/redux/slices/availabilitySlice'
import { useAppDispatch, useReduxAvailability, useReduxConfig } from '@/redux/hooks'
import { GeneratePrice } from '@/components/ui/atoms/GeneratePriceAtom'
import type { durationPropsType } from '@/lib/types'

export default function DurationPicker({
  allowedDurations: allowedDurationsProps,
  price: priceProps,
  duration: durationProps,
  configuration,
  showPrice = true,
}: durationPropsType) {
  const { pricing: priceRedux, allowedDurations: allowedDurationsRedux } = useReduxConfig()
  const { duration: durationRedux } = useReduxAvailability()
  const dispatch = useAppDispatch()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDuration(Number(event.target.value)))
  }

  const duration = durationRedux || durationProps || DEFAULT_DURATION
  const allowedDurations = allowedDurationsRedux || allowedDurationsProps || ALLOWED_DURATIONS
  const price = priceRedux || priceProps || DEFAULT_PRICING
  const sessionCost = price[duration || DEFAULT_DURATION] ?? ''
  const pricingLabel = configuration?.pricingLabels?.[duration || DEFAULT_DURATION]
  const hidePricing = configuration?.acceptingPayment === false

  const cols = allowedDurations.length <= 4 ? allowedDurations.length : 3
  const useGrid = allowedDurations.length > 4

  return (
    <fieldset>
      <legend className="block pb-2 text-sm leading-0 font-medium text-accent-900 dark:text-accent-100">
        <span>{`${duration || 90} minute session${pricingLabel ? ',' : ''}`} </span>
        {pricingLabel ? (
          <span className="text-primary-600 dark:text-primary-400">{pricingLabel}</span>
        ) : (
          !hidePricing &&
          showPrice && <GeneratePrice price={sessionCost} discount={configuration?.discount} />
        )}
      </legend>
      <div
        className={clsx('isolate mt-1 overflow-hidden rounded-xl border border-accent-300', {
          'grid grid-cols-3': useGrid,
          'inline-flex': !useGrid,
        })}
      >
        {allowedDurations.map((theDuration, i) => (
          <div key={theDuration}>
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
                'outline-primary-600 relative flex items-center justify-center px-3 py-2.5 text-sm font-semibold focus:z-10',
                useGrid
                  ? {
                      'border-b border-accent-300': i < allowedDurations.length - cols,
                      'border-r border-accent-300': (i + 1) % cols !== 0,
                    }
                  : {
                      'border-r border-accent-300': i < allowedDurations.length - 1,
                    },
                {
                  'bg-surface-50 text-accent-900 hover:bg-surface-200': theDuration !== duration,
                  'bg-primary-500 text-white shadow-inner': theDuration === duration,
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
