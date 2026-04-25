import clsx from 'clsx'
import type { ComponentType, DetailedHTMLProps, HTMLAttributes } from 'react'
import { FaShrimp } from 'react-icons/fa6'
import {
  GiCrab,
  GiCrabClaw,
  GiDolphin,
  GiGiantSquid,
  GiJellyfish,
  GiOctopus,
  GiSadCrab,
  GiSeaTurtle,
  GiSeahorse,
  GiShrimp,
  GiSpermWhale,
  GiSpiralShell,
  GiSquid,
  GiWhaleTail,
  GiClownfish,
  GiAnglerFish,
  GiFishEscape,
  GiNautilusShell,
  GiCoral,
} from 'react-icons/gi'

import { formatLocalTime } from 'lib/availability/helpers'
import type { StringDateTimeInterval, LocationObject } from 'lib/types'

type IconProps = { className?: string }

const SEA_CRITTERS: {
  icon: ComponentType<IconProps>
  bg: string
  color: string
}[] = [
  { icon: FaShrimp, bg: 'from-red-500 to-orange-500', color: 'text-primary-400' },
  { icon: GiOctopus, bg: 'from-purple-500 to-violet-400', color: 'text-amber-300' },
  { icon: GiSeahorse, bg: 'from-cyan-500 to-teal-400', color: 'text-pink-300' },
  { icon: GiJellyfish, bg: 'from-pink-500 to-rose-400', color: 'text-yellow-200' },
  { icon: GiCrab, bg: 'from-orange-500 to-red-400', color: 'text-teal-300' },
  { icon: GiDolphin, bg: 'from-blue-500 to-cyan-400', color: 'text-rose-300' },
  { icon: GiSeaTurtle, bg: 'from-emerald-500 to-green-400', color: 'text-purple-300' },
  { icon: GiSquid, bg: 'from-indigo-500 to-blue-400', color: 'text-orange-300' },
  { icon: GiSpermWhale, bg: 'from-slate-500 to-blue-400', color: 'text-amber-200' },
  { icon: GiClownfish, bg: 'from-amber-500 to-orange-400', color: 'text-blue-300' },
  { icon: GiCrabClaw, bg: 'from-red-600 to-rose-400', color: 'text-cyan-300' },
  { icon: GiSpiralShell, bg: 'from-teal-500 to-emerald-400', color: 'text-red-300' },
  { icon: GiAnglerFish, bg: 'from-violet-500 to-purple-400', color: 'text-lime-300' },
  { icon: GiGiantSquid, bg: 'from-fuchsia-500 to-violet-400', color: 'text-green-300' },
  { icon: GiSadCrab, bg: 'from-rose-500 to-pink-400', color: 'text-emerald-300' },
  { icon: GiWhaleTail, bg: 'from-sky-500 to-blue-400', color: 'text-amber-300' },
  { icon: GiShrimp, bg: 'from-lime-500 to-yellow-400', color: 'text-violet-400' },
  { icon: GiNautilusShell, bg: 'from-green-500 to-lime-400', color: 'text-fuchsia-300' },
  { icon: GiFishEscape, bg: 'from-yellow-500 to-amber-400', color: 'text-indigo-400' },
  { icon: GiCoral, bg: 'from-orange-600 to-yellow-400', color: 'text-indigo-300' },
]

function hashSessionId(sessionId: string): number {
  let hash = 0
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % SEA_CRITTERS.length
}

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
  onTimeSelect,
  ...props
}: TimeProps) {
  const isDisabled = disabled || held
  const critter = holderSessionId
    ? SEA_CRITTERS[hashSessionId(holderSessionId)]
    : SEA_CRITTERS[0]
  const CritterIcon = critter.icon

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
      onClick={() => onTimeSelect({ start, end }, location)}
      {...props}
    >
      {loading ? (
        <span className="animate-pulse">Holding…</span>
      ) : (
        <span className={held ? 'text-accent-400 dark:text-accent-500' : ''}>
          {formatLocalTime(start, { timeZone })} – {formatLocalTime(end, { timeZone })}
        </span>
      )}
      {held && (
        <span
          className={clsx(
            'absolute -top-2 flex h-6 w-6 animate-bob-wobble items-center justify-center rounded-full bg-gradient-to-br shadow-sm',
            critter.bg
          )}
        >
          <CritterIcon className={clsx('h-4 w-4', critter.color)} />
        </span>
      )}
      {presenceCount != null && presenceCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
          {presenceCount}
        </span>
      ) : null}
    </button>
  )
}
