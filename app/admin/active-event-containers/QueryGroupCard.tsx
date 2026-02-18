import { FaSearch } from 'react-icons/fa'
import type { QueryGroup } from './getActiveContainers'
import { EventList } from './EventList'
import { formatDateTime } from './formatDateTime'

export function QueryGroupCard({ group }: { group: QueryGroup }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="bg-gray-50 px-6 py-4 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Query: <code className="text-blue-600 dark:text-blue-400">{group.query}</code>
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Used by {group.slugs.length} slug{group.slugs.length !== 1 ? 's' : ''}:
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {group.slugs.map((slugInfo) => (
                  <span
                    key={slugInfo.slug}
                    className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                  >
                    /{slugInfo.slug}
                    <span className="ml-1 text-blue-600 dark:text-blue-300">({slugInfo.type})</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Search Query:{' '}
                <code className="bg-gray-100 px-1 dark:bg-gray-600">__EVENT__ (generic)</code>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Local Filter:{' '}
                <code className="bg-blue-100 px-1 dark:bg-blue-800">{group.searchQuery}</code>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Container Pattern:{' '}
                <code className="bg-green-100 px-1 dark:bg-green-800">
                  {group.eventContainerString}
                </code>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Member Pattern:{' '}
                <code className="bg-orange-100 px-1 dark:bg-orange-800">
                  {group.eventMemberString}
                </code>
              </p>
            </div>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600 dark:text-green-400">
                {group.containers.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Containers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600 dark:text-orange-400">
                {group.members.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Members</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-600 dark:text-gray-400">
                {group.allEvents.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total Events</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {group.allEvents.length > 0 && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h4 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
              <FaSearch className="mr-1 inline" /> Debug: All Events Found by Search Query "
              {group.searchQuery}" ({group.allEvents.length})
            </h4>
            <div className="max-h-40 overflow-y-auto">
              {group.allEvents.map((event) => (
                <div key={event.id} className="mb-1 text-xs">
                  <span className="font-mono text-blue-800 dark:text-blue-200">
                    "{event.summary}" - {formatDateTime(event.start.dateTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <EventList
            events={group.containers}
            color="green"
            label="Container Events"
            emptyMessage="No container events found. Create events with names containing:"
            patternString={group.eventContainerString}
          />
          <EventList
            events={group.members}
            color="orange"
            label="Member Events"
            emptyMessage="No member events found. These are created when bookings are made within container events."
          />
        </div>
      </div>
    </div>
  )
}
