/* ds-ignore-file */
'use client'

import Image from 'next/image'
import Link from '@/components/Link'
import { useState } from 'react'
import type { SlugConfigurationType } from '@/lib/types'
import { Stack } from '@/components/ui/stack'

export default function OgPreviewGrid({
  slugs,
  configs,
}: {
  slugs: string[]
  configs: Record<string, SlugConfigurationType>
}) {
  const [filter, setFilter] = useState('')
  const filtered = filter
    ? slugs.filter(
        (s) =>
          s.includes(filter.toLowerCase()) ||
          configs[s]?.title?.toLowerCase().includes(filter.toLowerCase())
      )
    : slugs

  return (
    <>
      <input
        type="text"
        placeholder="Filter slugs or titles…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-8 w-full rounded-lg border border-accent-300 bg-surface-50 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-accent-600 dark:bg-surface-800"
      />
      <p className="mb-4 text-sm text-accent-500">
        {filtered.length} / {slugs.length} slugs
      </p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {filtered.map((slug) => {
          const config = configs[slug]
          const ogUrl = `/${slug}/opengraph-image`
          const bookUrl = `/book/${slug}`
          return (
            <div
              key={slug}
              className="overflow-hidden rounded-lg border border-accent-200 dark:border-accent-700"
            >
              <div className="bg-surface-100 px-4 py-2 dark:bg-surface-800">
                <Stack direction="row" align="center" justify="between" gap={2}>
                  <code className="truncate font-mono text-xs text-accent-600 dark:text-accent-400">
                    {slug}
                  </code>
                  <Stack direction="row" gap={3} className="shrink-0 text-xs">
                    <Link href={bookUrl} className="text-primary-600 hover:underline">
                      book
                    </Link>
                    <Link href={ogUrl} className="text-primary-600 hover:underline">
                      raw
                    </Link>
                  </Stack>
                </Stack>
                {config.title && (
                  <p className="mt-1 truncate text-sm font-medium">{config.title}</p>
                )}
              </div>
              <Link href={ogUrl}>
                <Image
                  src={ogUrl}
                  alt={slug}
                  width={1200}
                  height={630}
                  className="w-full"
                  unoptimized
                />
              </Link>
            </div>
          )
        })}
      </div>
    </>
  )
}
