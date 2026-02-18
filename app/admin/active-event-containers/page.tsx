import { Metadata } from 'next'
import Day from '@/lib/day'
import SectionContainer from '@/components/SectionContainer'
import { getActiveContainers } from './getActiveContainers'
import { QueryGroupCard } from './QueryGroupCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Active Event Containers - Admin',
  description: 'Monitor active event containers and their associated events',
}

export default async function ActiveEventContainersPage() {
  const queryGroups = await getActiveContainers()
  const totalContainers = queryGroups.reduce((sum, group) => sum + group.containers.length, 0)
  const totalMembers = queryGroups.reduce((sum, group) => sum + group.members.length, 0)

  return (
    <SectionContainer>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Active Event Containers
          </h1>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  System Overview
                </h2>
                <p className="text-blue-700 dark:text-blue-200">
                  Monitoring period: {Day.todayWithOffset(0).toString()} to{' '}
                  {Day.todayWithOffset(21).toString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalContainers}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Containers</div>
                <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {totalMembers}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total Members</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {queryGroups.map((group) => (
            <QueryGroupCard key={group.query} group={group} />
          ))}

          {queryGroups.length === 0 && (
            <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                No Event Containers Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No slug configurations with eventContainer property or scheduled-site type were
                found.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            How Event Containers Work
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong className="text-green-600 dark:text-green-400">Container Events:</strong>{' '}
              Define available time slots. Create Google Calendar events with names containing{' '}
              <code>QUERY__EVENT__CONTAINER__</code>
            </p>
            <p>
              <strong className="text-orange-600 dark:text-orange-400">Member Events:</strong>{' '}
              Represent booked appointments within containers. These are automatically created when
              users book appointments, with names containing <code>QUERY__EVENT__MEMBER__</code>
            </p>
            <p>
              <strong className="text-gray-700 dark:text-gray-300">Availability:</strong> The system
              generates time slots within container events that don't overlap with member events.
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
