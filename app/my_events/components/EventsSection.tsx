import clsx from 'clsx'
import { GoogleCalendarV3Event } from '@/lib/types'
import { CategorizedEventList } from './EventComponents'

export function EventsSection({
  email,
  loading,
  error,
  hasSearched,
  events,
  searchEvents,
}: {
  email: string
  loading: boolean
  error: string | null
  hasSearched: boolean
  events: GoogleCalendarV3Event[]
  searchEvents: () => void
}) {
  return (
    <>
      <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <div className="flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-green-600 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="font-medium text-green-700 dark:text-green-300">Email verified: {email}</p>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-gray-50 p-6 shadow-sm dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Search Your Events
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Find all events associated with {email}
            </p>
          </div>
          <button
            onClick={searchEvents}
            disabled={loading}
            className={clsx(
              'rounded-md px-6 py-2 text-white transition-colors',
              loading
                ? 'bg-blue-400 dark:bg-blue-400'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            )}
          >
            {loading ? 'Searching...' : 'Search Events'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {hasSearched && !loading && (
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Search Results
          </h2>

          {events.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No events found for "{email}"</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                No appointments or events were found for this email address.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found {events.length} event{events.length !== 1 ? 's' : ''} for "{email}"
              </p>

              <CategorizedEventList events={events} />
            </div>
          )}
        </div>
      )}
    </>
  )
}
