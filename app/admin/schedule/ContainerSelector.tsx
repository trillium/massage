'use client'

import type { QueryGroup } from '../active-event-containers/getActiveContainers'
import { formatDateTime } from '../active-event-containers/formatDateTime'

type Props = {
  queryGroups: QueryGroup[]
  selectedQuery: string
  selectedContainerId: string
  onSelect: (query: string, containerId: string) => void
}

export function ContainerSelector({
  queryGroups,
  selectedQuery,
  selectedContainerId,
  onSelect,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [query, containerId] = e.target.value.split('::')
    onSelect(query, containerId)
  }

  return (
    <select
      value={`${selectedQuery}::${selectedContainerId}`}
      onChange={handleChange}
      className="w-full rounded-md border border-accent-300 bg-surface-50 px-3 py-2 text-sm text-accent-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-accent-600 dark:bg-surface-800 dark:text-accent-100"
    >
      {queryGroups.map((group) =>
        group.containers.map((container) => (
          <option key={container.id} value={`${group.query}::${container.id}`}>
            {group.query} — {formatDateTime(container.start.dateTime)}
          </option>
        ))
      )}
    </select>
  )
}
