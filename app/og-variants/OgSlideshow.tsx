/* ds-ignore-file */
'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'

export default function OgSlideshow({ variants }: { variants: string[] }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const prev = () => setIndex((i) => (i - 1 + variants.length) % variants.length)
  const next = () => setIndex((i) => (i + 1) % variants.length)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
  }

  const name = variants[index]

  return (
    <div className="flex min-h-svh flex-col bg-surface-950 text-white">
      {/* header */}
      <div className="flex items-center justify-end px-4 py-3">
        <span className="text-xs text-accent-500">
          {index + 1} / {variants.length}
        </span>
      </div>

      {/* image */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={name}
          src={`/og-variants/${name}/opengraph-image`}
          alt={name}
          width={1200}
          height={630}
          className="w-full rounded-lg"
          unoptimized
          priority
        />
        <p className="mt-3 font-mono text-lg font-semibold text-white">{name}</p>
      </div>

      {/* nav */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <button
          onClick={prev}
          className="rounded-lg bg-surface-800 py-4 text-xl font-bold active:bg-surface-700"
        >
          ←
        </button>
        <a
          href={`/og-variants/${name}/opengraph-image`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center rounded-lg bg-primary-700 py-4 text-sm font-medium active:bg-primary-600"
        >
          raw
        </a>
        <button
          onClick={next}
          className="rounded-lg bg-surface-800 py-4 text-xl font-bold active:bg-surface-700"
        >
          →
        </button>
      </div>
    </div>
  )
}
