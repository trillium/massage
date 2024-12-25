import clsx from "clsx"
import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react"
import { twMerge } from "tailwind-merge"

import Day from "@/lib/day"

import { setSelectedDate } from "@/redux/slices/availabilitySlice"
import { useAppDispatch, useReduxAvailability } from "@/app/hooks"

type DayProps = {
  date: Day
  availabilityScore: number
  hasAvailability: boolean
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

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

  const isSelected = selectedDate
    ? date.toString() === selectedDate.toString()
    : false

  const isDisabled = !hasAvailability

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchRedux(setSelectedDate(date.toString()))
  }

  return (
    <div>
      <input
        onChange={handleChange}
        id={`day-${date.getDay()}`}
        name="day"
        type="radio"
        className="sr-only"
        disabled={isDisabled}
        checked={isSelected}
      />
      <label
        htmlFor={`day-${date.getDay()}`}
        // type="button"
        className={twMerge(
          clsx(
            "transition-all flex flex-col items-center outline-primary-600 relative",
            props.className,
            {
              "font-semibold bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hocus:border-primary-500 hocus:shadow-sm hocus:shadow-primary-100 hocus:z-10 border border-transparent":
                !isDisabled,
              "bg-white dark:bg-slate-200 text-gray-500 dark:text-gray-500":
                isDisabled,
              // "bg-primary-500": isSelected && !isToday,
              // "bg-primary-600 dark:bg-primary-600 hover:bg-primary-500": isSelected && isToday,
              "text-white dark:text-gray-100 bg-primary-500 dark:bg-primary-600":
                isSelected,
            }
          )
        )}
        disabled={isDisabled}
        aria-pressed={isSelected}
        aria-disabled={isDisabled}
        aria-label={`${isToday ? "Today" : ""} ${isDisabled ? "Unavailable" : "Available"
          } date ${date.toString()} in calendar`}
        {...props}>
        <div className="m-4 flex flex-col items-center justify-between leading-none">
          <p
            className={clsx(
              "font-semibold text-[0.55rem] leading-0 h-3 items-center flex",
              {
                "text-white": isSelected,
                "text-gray-500 dark:text-gray-500": isDisabled && !isSelected,
                "text-primary-700 dark:text-primary-600": !isSelected,
              }
            )}>
            {isToday && "TODAY"}
          </p>
          <time className="text-base flex leading-0 items-center">
            {date.getDay()}
          </time>
          <figure
            className="flex items-center space-x-0.5 h-3 justify-center"
            aria-hidden="true">
            {Array.from({ length: isDisabled ? 0 : availabilityScore }).map(
              (_, index) => (
                <div
                  key={`availability-bar-${index}`}
                  className={clsx("rounded-full w-1 h-1", {
                    "bg-white": isSelected,
                    "bg-green-600": !isSelected,
                  })}
                />
              )
            )}
          </figure>
        </div>
      </label>
    </div>
  )
}
