'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useReduxAvailability, useAppDispatch } from '@/redux/hooks'
import { setSelectedTime } from '@/redux/slices/availabilitySlice'
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
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const showDebug =
    searchParams.get('debug') !== 'false' && (isLocalhost || searchParams.get('debug') === 'true')
  const { slots: slotsRedux, selectedDate, selectedTime, timeZone } = useReduxAvailability()
  const dispatch = useAppDispatch()
  const { claimHold, claiming } = useSlotHoldContext()
  const {
    heldSlots,
    debug: heldSlotsDebug,
    getHolderSessionId,
    getShooCount,
    sessionId,
  } = useHeldSlots()
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

  return (
    <div className="relative pt-2">
      <DataFreshnessPill />
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
      {showDebug && heldSlotsDebug.fetchCount > 0 && (
        <div className="mt-4 rounded bg-surface-100 p-3 text-xs dark:bg-surface-800">
          <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400">
            <span
              className={`inline-block h-2 w-2 rounded-full ${heldSlotsDebug.channelStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-amber-500'}`}
            />
            <span>{heldSlotsDebug.mode === 'realtime' ? 'Live' : 'Polling'}</span>
            <span>·</span>
            <span>{heldSlotsDebug.fetchCount} fetches</span>
          </div>
          {heldSlots.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {heldSlots.map((h) => (
                <li key={h.session_id + h.start_time} className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatLocalTime(h.start_time)}–{formatLocalTime(h.end_time)}
                    </span>
                    <span className="text-surface-400">
                      {h.session_id === sessionId ? '(you)' : '(other)'}
                    </span>
                    <span className="text-surface-400">
                      match: {availability?.some((s) => s.start === h.start_time) ? 'yes' : 'NO'}
                    </span>
                  </span>
                  <span className="font-mono text-surface-400">
                    hold: {h.start_time} | slot: {availability?.[0]?.start ?? 'none'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-surface-400">No holds</p>
          )}
        </div>
      )}
    </div>
  )
}
