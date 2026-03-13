import { getActiveContainers } from '../active-event-containers/getActiveContainers'
import { SchedulePanel } from './SchedulePanel'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const queryGroups = await getActiveContainers()

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-accent-900 dark:text-accent-100">Schedule</h1>
      <SchedulePanel queryGroups={queryGroups} />
    </div>
  )
}
