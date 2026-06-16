import { H3 } from '@/components/ui/heading'
import { TextSmMuted, TextXs, TextXsMedium, TextBase } from '@/components/ui/text'
interface Attendee {
  email?: string
  displayName: string
  responseStatus: string
  organizer?: boolean
}
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export default function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  return (
    <Box>
      <H3 className="mb-2 dark:text-white">Attendees</H3>
      <div className="space-y-2">
        {attendees.map((attendee, index) => (
          <Stack direction="row" align="center" justify="between" className="rounded bg-surface-200 p-3 dark:bg-surface-700" key={index}>
            <Box>
              <TextBase className="font-medium text-accent-900 dark:text-white">
                {attendee.displayName}
                {attendee.organizer && (
                  <TextXs
                    className="ml-2 rounded bg-blue-100 px-2 py-1 dark:bg-blue-900"
                    status="info"
                  >
                    Organizer
                  </TextXs>
                )}
              </TextBase>
              <TextSmMuted>{attendee.email}</TextSmMuted>
            </Box>
            <TextXsMedium
              className="rounded px-2 py-1 ${ attendee.responseStatus === 'accepted' ? 'bg-green-100 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200' }"
              status="success"
            >
              {attendee.responseStatus}
            </TextXsMedium>
          </Stack>
        ))}
      </div>
    </Box>
  )
}
