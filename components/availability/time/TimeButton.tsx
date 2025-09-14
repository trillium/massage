import clsx from 'clsx'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

import { formatLocalTime } from 'lib/availability/helpers'
import type { StringDateTimeInterval, LocationObject } from 'lib/types'

type TimeProps = {
  time: StringDateTimeInterval
  active: boolean
  timeZone: string
  location?: LocationObject
  onTimeSelect: (time: StringDateTimeInterval, location?: LocationObject) => void
} & Omit<DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick'>

export default function TimeButton({
  time: { start, end },
  active,
  timeZone,
  location,
  onTimeSelect,
  ...props
}: TimeProps) {
  return (
    <button
      type="button"
      className={clsx(
        'rounded-md border border-slate-300 px-3 py-2 shadow-sm transition-all',
        'text-sm text-gray-900',
        'hocus:bg-primary-50/20 hocus:shadow-sm hocus:shadow-primary-100 hocus:border-primary-500 dark:hocus:text-gray-200 cursor-pointer',
        'outline-primary-600 active:mt-0.5 active:-mb-0.5',
        {
          'bg-primary-500 font-bold text-white': active,
          'bg-white font-semibold text-gray-900': !active,
        }
      )}
      onClick={() => onTimeSelect({ start, end }, location)}
      {...props}
    >
      {formatLocalTime(start, { timeZone })} – {formatLocalTime(end, { timeZone })}
    </button>
  )
}
