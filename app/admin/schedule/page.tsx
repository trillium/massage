import { getActiveContainers } from '../active-event-containers/getActiveContainers'
import { SchedulePanel } from './SchedulePanel'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const queryGroups = await getActiveContainers()

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Schedule</h1>
      <SchedulePanel queryGroups={queryGroups} />
    </div>
  )
}
