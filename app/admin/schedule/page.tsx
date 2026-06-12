import { getActiveContainers } from '../active-event-containers/getActiveContainers'
import { SchedulePanel } from './SchedulePanel'
import { H1 } from '@/components/ui/heading'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const queryGroups = await getActiveContainers()

  return (
    <div>
      <H1 className="mb-4">Schedule</H1>
      <SchedulePanel queryGroups={queryGroups} />
    </div>
  )
}
