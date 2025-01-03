import clsx from 'clsx'
import type { DetailedHTMLProps, LabelHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

import Day from 'lib/day'

import { setSelectedDate } from '@/redux/slices/availabilitySlice'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'

type DayProps = {
  date: Day
  availabilityScore: number
  hasAvailability: boolean
} & DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>

export default function DayButton({
  date,
  availabilityScore,
  hasAvailability,
  ...props
}: DayProps): JSX.Element {
  const { selectedDate } = useReduxAvailability()

  const dispatchRedux = useAppDispatch()

  const now = Day.todayWithOffset(0)

  // Facts about the current date used to apply formatting/logic later.

  const isToday = date.toString() === now.toString()

  const isSelected = selectedDate ? date.toString() === selectedDate.toString() : false

  const isDisabled = !hasAvailability

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchRedux(setSelectedDate(date.toString()))
  }

  return (
    <div>
      <label
        htmlFor={`day-${date.getDay()}`}
        className={twMerge(
          clsx('relative flex flex-col items-center transition-all', props.className, {
            'hocus:shadow-sm hocus:shadow-primary-100 hocus:z-10 cursor-pointer bg-slate-300 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200':
              !isDisabled,
            'bg-white text-gray-500 dark:bg-slate-200 dark:text-gray-500': isDisabled,
            'bg-primary-500 text-white dark:bg-primary-600 dark:text-gray-100': isSelected,
          })
        )}
        aria-label={`${isToday ? 'Today' : ''} ${isDisabled ? 'Unavailable' : 'Available'
          } date ${date.toString()} in calendar`}
        {...props}
      >
        <input
          onChange={handleChange}
          id={`day-${date.getDay()}`}
          name="day"
          type="radio"
          className="sr-only"
          disabled={isDisabled}
          checked={isSelected}
        />
        <div className="m-4 flex flex-col items-center justify-between leading-none">
          <p
            className={clsx('leading-0 flex h-3 items-center text-[0.55rem] font-semibold', {
              'text-white': isSelected,
              'text-gray-500 dark:text-gray-500': isDisabled && !isSelected,
              'text-primary-700 dark:text-primary-600': !isSelected,
            })}
          >
            {isToday && 'TODAY'}
          </p>
          <time className="leading-0 flex items-center text-base">{date.getDay()}</time>
          <figure className="flex h-3 items-center justify-center space-x-0.5" aria-hidden="true">
            {Array.from({ length: isDisabled ? 0 : availabilityScore }).map((_, index) => (
              <div
                key={`availability-bar-${index}`}
                className={clsx('h-1 w-1 rounded-full', {
                  'bg-white': isSelected,
                  'bg-green-600': !isSelected,
                })}
              />
            ))}
          </figure>
        </div>
      </label>
    </div>
  )
}
