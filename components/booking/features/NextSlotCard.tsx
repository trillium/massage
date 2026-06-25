'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useReduxAvailability } from '@/redux/hooks'
import { setBookingForm } from '@/redux/slices/bookingFormSlice'
import { useClaimAndOpenBookingModal } from 'hooks/useClaimAndOpenBookingModal'
import { useHeldSlots } from 'hooks/useHeldSlots'
import TimeButton from '@/components/availability/time/TimeButton'
import { formatLocalDate } from 'lib/availability/helpers'
import type { StringDateTimeInterval, LocationObject } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { TextBaseSemibold, TextXs } from '@/components/ui/text'

function formatTimeUntil(startIso: string, now: number): string | null {
  const ms = new Date(startIso).getTime() - now
  if (Number.isNaN(ms) || ms <= 0) return 'starting now'

  const totalMinutes = Math.round(ms / 60_000)
  if (totalMinutes < 60) {
    return `in ${totalMinutes} min${totalMinutes === 1 ? '' : 's'}`
  }

  const totalHours = Math.round(ms / 3_600_000)
  if (totalHours < 24) {
    return `in ${totalHours} hour${totalHours === 1 ? '' : 's'}`
  }

  const totalDays = Math.round(ms / 86_400_000)
  return `in ${totalDays} day${totalDays === 1 ? '' : 's'}`
}

export default function NextSlotCard() {
  const dispatch = useAppDispatch()
  const { slots: slotsRedux, selectedTime, timeZone } = useReduxAvailability()
  const { claimAndOpen, claiming, claimingSlot } = useClaimAndOpenBookingModal()
  const { getHolderSessionId, getShooCount } = useHeldSlots('NextSlotCard')

  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

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

  const countdownLabel = formatTimeUntil(start, nowMs)

  const handleAsapSelect = (time: StringDateTimeInterval, loc?: LocationObject) => {
    dispatch(setBookingForm({ requestSooner: true }))
    return claimAndOpen(time, loc)
  }

  return (
    <Box variant="accentCard" className="flex h-full flex-col justify-center gap-3">
      <Stack direction="row" gap={2} className="items-center">
        <Badge
          variant="default"
          className="bg-primary-600 px-2 py-1 text-sm uppercase tracking-wide text-white dark:bg-primary-500"
          title="Booking this slot flags the appointment as ASAP — therapist may shift it earlier"
        >
          ASAP
        </Badge>
        {countdownLabel && (
          <TextBaseSemibold className="text-primary-700 dark:text-primary-300">
            {countdownLabel}
          </TextBaseSemibold>
        )}
      </Stack>
      <Stack direction="row" gap={2} className="items-baseline">
        <TextBaseSemibold className="text-lg">{dateLabel}</TextBaseSemibold>
        <TextXs status="muted">earliest available</TextXs>
      </Stack>
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
        onTimeSelect={handleAsapSelect}
      />
    </Box>
  )
}
