import clsx from 'clsx'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

import { formatLocalTime } from 'lib/availability/helpers'
import type { StringDateTimeInterval, LocationObject } from 'lib/types'

type TimeProps = {
  time: StringDateTimeInterval
  active: boolean
  timeZone: string
  location?: LocationObject
  className?: string
  presenceCount?: number
  disabled?: boolean
  loading?: boolean
  held?: boolean
  onTimeSelect: (time: StringDateTimeInterval, location?: LocationObject) => void
} & Omit<DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick'>

export default function TimeButton({
  time: { start, end },
  active,
  timeZone,
  location,
  className,
  presenceCount,
  disabled,
  loading,
  held,
  onTimeSelect,
  ...props
}: TimeProps) {
  const isDisabled = disabled || held

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={clsx(
        'relative rounded-md border border-accent-300 px-3 py-2 shadow-sm transition-all',
        'text-sm text-accent-900',
        'hocus:bg-primary-50/20 hocus:shadow-sm hocus:shadow-primary-100 hocus:border-primary-500 dark:hocus:text-accent-200 cursor-pointer',
        'outline-primary-600 active:mt-0.5 active:-mb-0.5',
        {
          'bg-primary-500 font-bold text-white': active,
          'bg-surface-50 font-semibold text-accent-900': !active && !held,
          'opacity-50 cursor-wait': disabled && !held,
          'opacity-40 cursor-not-allowed border-dashed': held,
        },
        className
      )}
      onClick={() => onTimeSelect({ start, end }, location)}
      {...props}
    >
      {loading ? (
        <span className="animate-pulse">Holding…</span>
      ) : held ? (
        <span className="text-accent-500 dark:text-accent-400">
          {formatLocalTime(start, { timeZone })} – {formatLocalTime(end, { timeZone })}
          <span className="ml-1.5 text-xs italic">held</span>
        </span>
      ) : (
        <>
          {formatLocalTime(start, { timeZone })} – {formatLocalTime(end, { timeZone })}
        </>
      )}
      {presenceCount != null && presenceCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
          {presenceCount}
        </span>
      ) : null}
    </button>
  )
}
