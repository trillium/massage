'use client'

import DurationPicker from '@/components/availability/controls/DurationPicker'
import Calendar from '@/components/availability/date/Calendar'
import { buildDurationProps } from '@/lib/slugConfigurations/helpers/buildDurationProps'
import { DEFAULT_DURATION } from 'config'
import uiData from '@/data/ui.json'
import { H3, H4 } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'

interface BookingPreviewProps {
  title?: string
}

const durationProps = buildDurationProps(DEFAULT_DURATION, null)

export default function BookingPreview({ title = 'Select Your Session' }: BookingPreviewProps) {
  return (
    <Box className="rounded-lg border border-accent-200 bg-surface-100 p-6 dark:border-accent-700 dark:bg-surface-900">
      {title && <H3 className="mb-6 dark:text-white">{title}</H3>}

      <Box className="space-y-8">
        <Box>
          <DurationPicker {...durationProps} />
        </Box>

        <Box>
          <H4 className="mb-4">{uiData.misc.chooseDate}</H4>
          <Calendar weeksDisplayOverride={6} />
        </Box>
      </Box>
    </Box>
  )
}
