'use client'

import { useState } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { setSelectedTime } from '@/redux/slices/availabilitySlice'
import { setModal } from '@/redux/slices/modalSlice'
import { setEventContainers } from '@/redux/slices/eventContainersSlice'
import { useSlotHoldContext } from 'hooks/SlotHoldContext'
import type { StringDateTimeInterval, LocationObject } from '@/lib/types'

export function useClaimAndOpenBookingModal() {
  const dispatch = useAppDispatch()
  const { claimHold, claiming } = useSlotHoldContext()
  const [claimingSlot, setClaimingSlot] = useState<string | null>(null)

  const claimAndOpen = async (time: StringDateTimeInterval, location?: LocationObject) => {
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

  return { claimAndOpen, claiming, claimingSlot }
}
