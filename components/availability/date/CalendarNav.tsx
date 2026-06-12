'use client'

import { format, isSameMonth } from 'date-fns'
import { TextSmSemibold } from '@/components/ui/text'

interface CalendarNavProps {
  pageStartDate: Date
  pageEndDate: Date
  onPrev: () => void
  onNext: () => void
  prevDisabled: boolean
  nextDisabled: boolean
}

export default function CalendarNav({
  pageStartDate,
  pageEndDate,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
}: CalendarNavProps) {
  const label = isSameMonth(pageStartDate, pageEndDate)
    ? format(pageStartDate, 'MMMM yyyy')
    : `${format(pageStartDate, 'MMMM')} \u2013 ${format(pageEndDate, 'MMMM yyyy')}`

  return (
    <div className="col-span-7 flex items-center justify-between px-3 py-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label="Previous page"
        className="rounded p-1 text-accent-600 transition-colors hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-accent-400 dark:hover:bg-accent-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <TextSmSemibold>{label}</TextSmSemibold>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        aria-label="Next page"
        className="rounded p-1 text-accent-600 transition-colors hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-accent-400 dark:hover:bg-accent-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}
