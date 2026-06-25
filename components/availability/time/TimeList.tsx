'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useReduxAvailability, useAppDispatch } from '@/redux/hooks'
import { setSelectedDate } from '@/redux/slices/availabilitySlice'
import { useHeldSlots } from 'hooks/useHeldSlots'
import { useClaimAndOpenBookingModal } from 'hooks/useClaimAndOpenBookingModal'
import TimeButton from './TimeButton'
import { DataFreshnessPill } from './DataFreshnessPill'
import type { StringDateTimeIntervalAndLocation } from '@/lib/types'

import { format } from 'date-fns-tz'
import { assertDateString, type DateString } from '@/lib/temporal/brands'
import { formatLocalTime } from 'lib/availability/helpers'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'

export default function TimeList({}) {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isLocalhost = mounted && window.location.hostname === 'localhost'
  const showDebug =
    mounted &&
    searchParams.get('debug') !== 'false' &&
    (isLocalhost || searchParams.get('debug') === 'true')
  const { slots: slotsRedux, selectedDate, selectedTime, timeZone } = useReduxAvailability()
  const dispatch = useAppDispatch()
  const { claimAndOpen, claiming, claimingSlot } = useClaimAndOpenBookingModal()
  const {
    heldSlots,
    debug: heldSlotsDebug,
    activeUsers,
    getHolderSessionId,
    getShooCount,
    sessionId,
  } = useHeldSlots('TimeList')

  const slots = slotsRedux || []

  const timeSignature = (selectedTime?.start ?? '') + (selectedTime?.end ?? '')

  const availabilityByDate = useMemo(
    () =>
      slots.reduce<Record<string, StringDateTimeIntervalAndLocation[]>>((acc, slot) => {
        const date = format(slot.start, 'yyyy-MM-dd', { timeZone })
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(slot)
        return acc
      }, {}),
    [slots, timeZone]
  )

  const availability = selectedDate ? availabilityByDate[selectedDate.toString()] : []

  const firstAvailableDate = useMemo<DateString | null>(() => {
    const dates = Object.keys(availabilityByDate).sort()
    return dates[0] ? assertDateString(dates[0]) : null
  }, [availabilityByDate])

  const hasNoAvailability =
    !!selectedDate && slots.length > 0 && (!availability || availability.length === 0)

  useEffect(() => {
    if (!hasNoAvailability || !firstAvailableDate) return
    const t = setTimeout(() => dispatch(setSelectedDate(firstAvailableDate)), 2500)
    return () => clearTimeout(t)
  }, [hasNoAvailability, firstAvailableDate, dispatch])

  const formattedSelectedDate = selectedDate
    ? format(new Date(selectedDate + 'T12:00:00'), 'MMMM d', { timeZone })
    : null

  return (
    <Box className="relative pt-2">
      <DataFreshnessPill />
      {hasNoAvailability ? (
        <Stack gap={2} align="center" className="py-6 text-center text-sm text-surface-400">
          <span>{`No times available on ${formattedSelectedDate}.`}</span>
          <span>{'Finding next available date…'}</span>
        </Stack>
      ) : (
        <Box className="grid grid-cols-2 gap-2">
          {availability?.map(({ start, end, location, className }) => {
            const slotKey = start + end
            const isActive = selectedTime ? slotKey === timeSignature : false
            const isLoading = claiming && claimingSlot === slotKey

            const holderSession = getHolderSessionId(start, end)

            return (
              <TimeButton
                key={slotKey}
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
                onShoo={() =>
                  fetch('/api/shoo-hold', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ start, end }),
                  })
                    .then((r) => r.json())
                    .then((d) => console.log('[shoo] response', d))
                    .catch((e) => console.error('[shoo] error', e))
                }
                onTimeSelect={claimAndOpen}
              />
            )
          })}
        </Box>
      )}
      {showDebug && (
        <Stack
          direction="row"
          gap={2}
          align="center"
          className="mt-2 text-xs text-surface-600 dark:text-surface-400"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${heldSlotsDebug.channelStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-amber-500'}`}
          />
          <span>{heldSlotsDebug.channelStatus}</span>
          <span>{'·'}</span>
          <span>{heldSlotsDebug.mode}</span>
          <span>{'·'}</span>
          <span>{`${heldSlots.length} holds`}</span>
          <span>{'·'}</span>
          <span>{`${activeUsers} users`}</span>
          <span>{'·'}</span>
          <span>{'logging to debug/slot-holds.jsonl'}</span>
        </Stack>
      )}
    </Box>
  )
}
