import clsx from 'clsx'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

import { formatLocalTime } from 'lib/availability/helpers'
import type { StringDateTimeInterval, LocationObject } from 'lib/types'
import SlotCritter from './SlotCritter'

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
  holderSessionId?: string | null
  shooCount?: number
  onShoo?: () => void
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
  holderSessionId,
  shooCount = 0,
  onShoo,
  onTimeSelect,
  ...props
}: TimeProps) {
  const isDisabled = disabled && !held

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
          'cursor-not-allowed border-dashed border-accent-200 bg-surface-100 dark:border-accent-700 dark:bg-surface-800':
            held,
        },
        className
      )}
      onClick={() => !held && onTimeSelect({ start, end }, location)}
      {...props}
    >
      {loading ? (
        <span className="animate-pulse">Holding…</span>
      ) : (
        <span className={held ? 'text-accent-400 dark:text-accent-500' : ''}>
          {formatLocalTime(start, { timeZone })} – {formatLocalTime(end, { timeZone })}
        </span>
      )}
      {held && holderSessionId && (
        <SlotCritter holderSessionId={holderSessionId} shooCount={shooCount} onShoo={onShoo} />
      )}
      {presenceCount != null && presenceCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
          {presenceCount}
        </span>
      ) : null}
    </button>
  )
}
