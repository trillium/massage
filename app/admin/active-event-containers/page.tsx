import { Metadata } from 'next'
import Day from '@/lib/day'
import SectionContainer from '@/components/SectionContainer'
import { getActiveContainers } from './getActiveContainers'
import { QueryGroupCard } from './QueryGroupCard'
import admin from '@/data/admin.json'

export const dynamic = 'force-dynamic'

const p = admin.activeEventContainersPage

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
          <h1 className="mb-4 text-3xl font-bold text-accent-900 dark:text-white">{p.heading}</h1>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  {p.overview.heading}
                </h2>
                <p className="text-blue-700 dark:text-blue-200">
                  {p.overview.monitoringPrefix}
                  {Day.todayWithOffset(0).toString()}
                  {p.overview.monitoringTo}
                  {Day.todayWithOffset(21).toString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalContainers}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {p.overview.totalContainersLabel}
                </div>
                <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {totalMembers}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {p.overview.totalMembersLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {queryGroups.map((group) => (
            <QueryGroupCard key={group.query} group={group} />
          ))}

          {queryGroups.length === 0 && (
            <div className="rounded-lg bg-surface-100 p-8 text-center dark:bg-surface-800">
              <h3 className="mb-2 text-lg font-medium text-accent-900 dark:text-white">
                {p.empty.heading}
              </h3>
              <p className="text-accent-600 dark:text-accent-400">{p.empty.message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-lg bg-surface-100 p-6 dark:bg-surface-800">
          <h3 className="mb-4 text-lg font-medium text-accent-900 dark:text-white">
            {p.howItWorks.heading}
          </h3>
          <div className="space-y-3 text-sm text-accent-600 dark:text-accent-400">
            <p>
              <strong className="text-green-600 dark:text-green-400">
                {p.howItWorks.containerEvents.label}
              </strong>{' '}
              {p.howItWorks.containerEvents.description}
              {/* biome-ignore lint/style/noJsxLiterals: calendar event naming convention identifier */}
              <code>QUERY__EVENT__CONTAINER__</code>
            </p>
            <p>
              <strong className="text-orange-600 dark:text-orange-400">
                {p.howItWorks.memberEvents.label}
              </strong>{' '}
              {p.howItWorks.memberEvents.description}
              {/* biome-ignore lint/style/noJsxLiterals: calendar event naming convention identifier */}
              <code>QUERY__EVENT__MEMBER__</code>
            </p>
            <p>
              <strong className="text-accent-700 dark:text-accent-300">
                {p.howItWorks.availability.label}
              </strong>
              {p.howItWorks.availability.description}
            </p>
          </div>
        </div>
      </div>
    </SectionContainer>
  )
}
