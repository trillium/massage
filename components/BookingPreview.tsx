'use client'

import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import { buildDurationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'
import { DEFAULT_DURATION } from 'config'

interface BookingPreviewProps {
  title?: string
}

const durationProps = buildDurationProps(DEFAULT_DURATION, null)

export default function BookingPreview({ title = 'Select Your Session' }: BookingPreviewProps) {
  return (
    <div className="rounded-lg border border-accent-200 bg-surface-100 p-6 dark:border-accent-700 dark:bg-surface-900">
      {title && <h3 className="mb-6 text-2xl font-bold dark:text-white">{title}</h3>}

      <div className="space-y-8">
        <div>
          <DurationPicker {...durationProps} />
        </div>

        <div>
          <h4 className="mb-4 text-lg font-semibold dark:text-accent-100">Choose a Date</h4>
          <Calendar weeksDisplayOverride={6} />
        </div>
      </div>
    </div>
  )
}
