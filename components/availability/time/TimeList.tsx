'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useReduxAvailability, useAppDispatch } from '@/redux/hooks'
import { setSelectedTime, setSelectedDate } from '@/redux/slices/availabilitySlice'
import { setModal } from '@/redux/slices/modalSlice'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'
import { useSlotHoldContext } from 'hooks/SlotHoldContext'
import { useHeldSlots } from 'hooks/useHeldSlots'
import TimeButton from './TimeButton'
import { DataFreshnessPill } from './DataFreshnessPill'
import type {
  StringDateTimeIntervalAndLocation,
  StringDateTimeInterval,
  LocationObject,
} from '@/lib/types'

import { format } from 'date-fns-tz'
import { formatLocalTime } from 'lib/availability/helpers'

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
  const { claimHold, claiming } = useSlotHoldContext()
  const {
    heldSlots,
    debug: heldSlotsDebug,
    activeUsers,
    getHolderSessionId,
    getShooCount,
    sessionId,
  } = useHeldSlots('TimeList')
  const [claimingSlot, setClaimingSlot] = useState<string | null>(null)

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

  const firstAvailableDate = useMemo(() => {
    const dates = Object.keys(availabilityByDate).sort()
    return dates[0] ?? null
  }, [availabilityByDate])

  const hasNoAvailability =
    !!selectedDate && slots.length > 0 && (!availability || availability.length === 0)

  useEffect(() => {
    if (!hasNoAvailability || !firstAvailableDate) return
    const t = setTimeout(() => dispatch(setSelectedDate(firstAvailableDate)), 2500)
    return () => clearTimeout(t)
  }, [hasNoAvailability, firstAvailableDate, dispatch])

  const handleTimeButtonClick = async (time: StringDateTimeInterval, location?: LocationObject) => {
    const slotKey = time.start + time.end
    setClaimingSlot(slotKey)

    dispatch(setSelectedTime({ start: time.start, end: time.end }))
    dispatch(setEventContainers({ location: location ?? undefined }))
    dispatch(setModal({ status: 'open' }))

    const held = await claimHold(time.start, time.end)
    setClaimingSlot(null)

    if (!held) {
      dispatch(setModal({ status: 'closed' }))
    }
  }

  const formattedSelectedDate = selectedDate
    ? format(new Date(selectedDate + 'T12:00:00'), 'MMMM d', { timeZone })
    : null

  return (
    <div className="relative pt-2">
      <DataFreshnessPill />
      {hasNoAvailability ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-surface-400">
          <span>No times available on {formattedSelectedDate}.</span>
          <span>Finding next available date…</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
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
                onTimeSelect={handleTimeButtonClick}
              />
            )
          })}
        </div>
      )}
      {showDebug && (
        <div className="mt-2 flex items-center gap-2 text-xs text-surface-400">
          <span
            className={`h-1.5 w-1.5 rounded-full ${heldSlotsDebug.channelStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-amber-500'}`}
          />
          <span>{heldSlotsDebug.channelStatus}</span>
          <span>·</span>
          <span>{heldSlotsDebug.mode}</span>
          <span>·</span>
          <span>{heldSlots.length} holds</span>
          <span>·</span>
          <span>{activeUsers} users</span>
          <span>·</span>
          <span>logging to debug/slot-holds.jsonl</span>
        </div>
      )}
    </div>
  )
}
