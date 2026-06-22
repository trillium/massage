'use client'

import { useReduxAvailability } from '@/redux/hooks'
import { useClaimAndOpenBookingModal } from 'hooks/useClaimAndOpenBookingModal'
import { useHeldSlots } from 'hooks/useHeldSlots'
import TimeButton from '@/components/availability/time/TimeButton'
import { formatLocalDate } from 'lib/availability/helpers'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { TextBaseSemibold, TextXs } from '@/components/ui/text'

export default function NextSlotCard() {
  const { slots: slotsRedux, selectedTime, timeZone } = useReduxAvailability()
  const { claimAndOpen, claiming, claimingSlot } = useClaimAndOpenBookingModal()
  const { getHolderSessionId, getShooCount } = useHeldSlots('NextSlotCard')

  const nextSlot = (slotsRedux ?? [])[0]

  if (!nextSlot) {
    return (
      <Box variant="accentCard" className="flex h-full flex-col justify-center">
        <TextXs status="muted">Next available</TextXs>
        <TextBaseSemibold>No immediate openings — see schedule below</TextBaseSemibold>
      </Box>
    )
  }

  const { start, end, location, className } = nextSlot
  const slotKey = start + end
  const isActive = selectedTime
    ? slotKey === (selectedTime.start ?? '') + (selectedTime.end ?? '')
    : false
  const isLoading = claiming && claimingSlot === slotKey
  const holderSession = getHolderSessionId(start, end)

  const dateLabel = formatLocalDate(start, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Stack direction="col" gap={2} className="h-full justify-center">
      <TextBaseSemibold>
        <TextXs as="span" status="muted">
          {'Next available · '}
        </TextXs>
        {dateLabel}
      </TextBaseSemibold>
      <TimeButton
        active={isActive}
        time={{ start, end }}
        timeZone={timeZone}
        location={location}
        className={className}
        disabled={claiming}
        loading={isLoading}
        held={!!holderSession}
        holderSessionId={holderSession}
        shooCount={getShooCount(start, end)}
        onTimeSelect={claimAndOpen}
      />
    </Stack>
  )
}
