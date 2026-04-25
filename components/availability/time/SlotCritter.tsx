import clsx from 'clsx'
import { useState } from 'react'
import type { ComponentType } from 'react'
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

export const SHOO_THRESHOLD = 5

type SlotCritterProps = {
  holderSessionId: string
  shooCount: number
  onShoo?: () => void
}

export default function SlotCritter({ holderSessionId, shooCount, onShoo }: SlotCritterProps) {
  const [optimisticShoo, setOptimisticShoo] = useState(0)
  const [splatKey, setSplatKey] = useState(0)

  const critter = SEA_CRITTERS[hashSessionId(holderSessionId)]
  const CritterIcon = critter.icon

  const displayShoo = Math.max(shooCount, optimisticShoo)
  const remaining = SHOO_THRESHOLD - displayShoo

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onShoo) return
    setSplatKey((k) => k + 1)
    setOptimisticShoo((prev) => prev + 1)
    onShoo()
  }

  return (
    <span
      onClick={handleClick}
      className={clsx(
        'absolute -top-2 z-10 flex h-6 w-6 animate-bob-wobble cursor-pointer items-center justify-center rounded-full bg-gradient-to-br shadow-sm',
        critter.bg
      )}
    >
      <CritterIcon className={clsx('h-4 w-4', critter.color)} />
      {displayShoo > 0 && (
        <span className="pointer-events-none absolute -top-3 left-1/2 flex -translate-x-1/2 gap-px">
          {remaining > 0 &&
            Array.from({ length: remaining }, (_, i) => {
              const isLast = remaining === 1 && i === 0
              return (
                <span
                  key={i}
                  className={clsx(
                    'text-[8px] leading-none text-red-500 drop-shadow-sm',
                    isLast && 'animate-pulse'
                  )}
                >
                  ♥
                </span>
              )
            })}
          <span key={`splat-${splatKey}`} className="absolute left-1/2 top-0 -translate-x-1/2">
            <span className="absolute animate-heart-splat-left text-[8px] text-red-500 drop-shadow-sm">
              ♥
            </span>
            <span className="absolute animate-heart-splat-right text-[8px] text-red-500 drop-shadow-sm">
              ♥
            </span>
          </span>
        </span>
      )}
    </span>
  )
}
