'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { ALLOWED_DURATIONS, DEFAULT_DURATION, DEFAULT_PRICING } from 'config'
import { setDuration } from '@/redux/slices/availabilitySlice'
import { useAppDispatch, useReduxAvailability, useReduxConfig } from '@/redux/hooks'
import { GeneratePrice } from '@/components/ui/atoms/GeneratePriceAtom'
import type { durationPropsType } from '@/lib/types'
import { StringDateTimeIntervalAndLocation } from '@/lib/types'

type EnhancedDurationPickerProps = durationPropsType & {
  multiDurationSlots?: Record<number, StringDateTimeIntervalAndLocation[]>
}

export default function EnhancedDurationPicker({
  allowedDurations: allowedDurationsProps,
  price: priceProps,
  duration: durationProps,
  configuration,
  multiDurationSlots,
}: EnhancedDurationPickerProps) {
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

  // Calculate availability for each duration
  const getDurationAvailability = (dur: number) => {
    if (!multiDurationSlots) return null
    const slots = multiDurationSlots[dur] || []
    return slots.length
  }

  return (
    <fieldset>
      <legend className="block pb-2 text-sm leading-0 font-medium text-gray-900 dark:text-gray-100">
        <span>{`${duration || 90} minute session`} </span>
        <GeneratePrice price={sessionCost} discount={configuration?.discount} />
      </legend>
      <div className="focus-within:ring-primary-500 active:ring-primary-500 isolate mt-1 inline-flex h-9 rounded-md shadow-sm focus-within:ring-2 active:ring-2">
        {allowedDurations.map((theDuration, i) => {
          const availableSlots = getDurationAvailability(theDuration)
          const hasAvailability = availableSlots !== null && availableSlots > 0
          const isUnavailable = availableSlots === 0

          return (
            <div key={theDuration} className="relative flex items-center rounded-r-md">
              <input
                id={`duration-${theDuration}`}
                name="duration"
                type="radio"
                value={theDuration}
                checked={duration === theDuration}
                onChange={handleChange}
                className="sr-only"
                disabled={isUnavailable}
              />
              <label
                htmlFor={`duration-${theDuration}`}
                className={clsx(
                  'outline-primary-600 relative inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:z-10',
                  {
                    'rounded-l-md': i === 0,
                    'rounded-r-md': i === allowedDurations.length - 1,
                    '-ml-px': i > 0,
                    // Available duration (not selected)
                    'bg-white text-gray-900 ring-gray-300 hover:bg-gray-200':
                      theDuration !== duration && hasAvailability,
                    // Selected duration
                    'bg-primary-500 shadow-primary-900 ring-primary-400 text-white shadow-inner':
                      theDuration === duration,
                    // Unavailable duration
                    'cursor-not-allowed bg-gray-100 text-gray-400 ring-gray-200':
                      isUnavailable && theDuration !== duration,
                  }
                )}
                title={
                  availableSlots !== null
                    ? `${availableSlots} slot${availableSlots !== 1 ? 's' : ''} available`
                    : undefined
                }
              >
                <span className="flex items-center">
                  {theDuration}m
                  {availableSlots !== null && (
                    <span className="ml-1 text-xs opacity-75">({availableSlots})</span>
                  )}
                </span>
              </label>
            </div>
          )
        })}
      </div>
      {multiDurationSlots && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Duration shows available slots in next 30 minutes
        </div>
      )}
    </fieldset>
  )
}
