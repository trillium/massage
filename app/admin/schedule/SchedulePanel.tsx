'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { QueryGroup } from '../active-event-containers/getActiveContainers'
import { computeTimelineBlocks } from './computeTimelineBlocks'
import { ContainerSelector } from './ContainerSelector'
import { TimelineBlock } from './TimelineBlock'

function findNearestContainer(queryGroups: QueryGroup[]): {
  query: string
  containerId: string
} | null {
  const now = Date.now()
  let best: { query: string; containerId: string; diff: number } | null = null

  for (const group of queryGroups) {
    for (const container of group.containers) {
      const start = new Date(container.start.dateTime!).getTime()
      const end = new Date(container.end.dateTime!).getTime()
      const inProgress = start <= now && now < end
      if (inProgress) return { query: group.query, containerId: container.id }
      const diff = Math.abs(start - now)
      if (!best || diff < best.diff) {
        best = { query: group.query, containerId: container.id, diff }
      }
    }
  }

  return best ? { query: best.query, containerId: best.containerId } : null
}

type Props = {
  queryGroups: QueryGroup[]
}

export function SchedulePanel({ queryGroups }: Props) {
  const nearest = findNearestContainer(queryGroups)
  const [selectedQuery, setSelectedQuery] = useState(nearest?.query ?? '')
  const [selectedContainerId, setSelectedContainerId] = useState(nearest?.containerId ?? '')
  const [now, setNow] = useState(new Date())
  const nowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [selectedContainerId])

  const group = queryGroups.find((g) => g.query === selectedQuery)
  const container = group?.containers.find((c) => c.id === selectedContainerId)

  const blocks = useMemo(() => {
    if (!container || !group) return []
    return computeTimelineBlocks(container, group.members)
  }, [container, group])

  const nowMs = now.getTime()

  if (queryGroups.length === 0 || !queryGroups.some((g) => g.containers.length > 0)) {
    return (
      <p className="text-sm text-accent-500 dark:text-accent-400">No active containers found.</p>
    )
  }

  const containerStart = container ? new Date(container.start.dateTime!).getTime() : 0
  const containerEnd = container ? new Date(container.end.dateTime!).getTime() : 0
  const nowInRange = containerStart <= nowMs && nowMs < containerEnd
  const nowPercent = nowInRange
    ? ((nowMs - containerStart) / (containerEnd - containerStart)) * 100
    : -1

  return (
    <div className="space-y-3">
      <ContainerSelector
        queryGroups={queryGroups}
        selectedQuery={selectedQuery}
        selectedContainerId={selectedContainerId}
        onSelect={(q, id) => {
          setSelectedQuery(q)
          setSelectedContainerId(id)
        }}
      />

      {!container ? (
        <p className="text-sm text-accent-500 dark:text-accent-400">Select a container above.</p>
      ) : (
        <div className="relative space-y-1.5">
          {blocks.map((block, i) => {
            const blockEnd = new Date(block.end).getTime()
            const blockStart = new Date(block.start).getTime()
            const isPast = blockEnd <= nowMs
            const isInProgress = blockStart <= nowMs && nowMs < blockEnd

            return (
              <div key={`${block.type}-${block.start}`}>
                {nowInRange && isInProgress && (
                  <div ref={nowRef} className="my-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <div className="h-px flex-1 bg-red-500" />
                    <span className="text-xs font-medium text-red-500">
                      {now.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                <TimelineBlock block={block} isPast={isPast} isInProgress={isInProgress} />
              </div>
            )
          })}

          {nowInRange &&
            blocks.length > 0 &&
            !blocks.some((b) => {
              const bStart = new Date(b.start).getTime()
              const bEnd = new Date(b.end).getTime()
              return bStart <= nowMs && nowMs < bEnd
            }) && (
              <div ref={nowRef} className="my-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <div className="h-px flex-1 bg-red-500" />
                <span className="text-xs font-medium text-red-500">
                  {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
