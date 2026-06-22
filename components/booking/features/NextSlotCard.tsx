'use client'

import { useReduxAvailability } from '@/redux/hooks'
import { useClaimAndOpenBookingModal } from 'hooks/useClaimAndOpenBookingModal'
import { useHeldSlots } from 'hooks/useHeldSlots'
import { formatLocalTime } from 'lib/availability/helpers'
import { Box } from '@/components/ui/box'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { TextBaseSemibold, TextXs } from '@/components/ui/text'

export default function NextSlotCard() {
  const { slots: slotsRedux } = useReduxAvailability()
  const { claimAndOpen, claiming, claimingSlot } = useClaimAndOpenBookingModal()
  const { getHolderSessionId } = useHeldSlots('NextSlotCard')

  const nextSlot = (slotsRedux ?? [])[0]

  if (!nextSlot) {
    return (
      <Box variant="accentCard" className="flex h-full flex-col justify-center">
        <TextXs status="muted">Next available</TextXs>
        <TextBaseSemibold>No immediate openings — see schedule below</TextBaseSemibold>
      </Box>
    )
  }

  const { start, end, location } = nextSlot
  const slotKey = start + end
  const isLoading = claiming && claimingSlot === slotKey
  const isHeld = !!getHolderSessionId(start, end)

  return (
    <Box variant="accentCard" className="flex h-full flex-col justify-between">
      <Stack direction="col" gap={1}>
        <TextXs status="muted">Next available</TextXs>
        <TextBaseSemibold status="primary">
          {`${formatLocalTime(start)} – ${formatLocalTime(end)}`}
        </TextBaseSemibold>
      </Stack>
      <Button
        type="button"
        className="mt-3 w-full"
        disabled={claiming || isHeld}
        onClick={() => claimAndOpen({ start, end }, location)}
      >
        {isLoading ? 'Reserving…' : isHeld ? 'Just taken' : 'Book this slot'}
      </Button>
    </Box>
  )
}
