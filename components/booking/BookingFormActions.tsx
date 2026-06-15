import React from 'react'
import Spinner from 'components/Spinner'
import { setModal } from '@/redux/slices/modalSlice'
import { useAppDispatch, useReduxModal } from '@/redux/hooks'
import { useSlotHoldContext } from 'hooks/SlotHoldContext'
import booking from '@/data/booking.json'

import { Button } from '@/components/ui/button'

interface BookingFormActionsProps {
  onSubmitLabel?: string
}

const BookingFormActions: React.FC<BookingFormActionsProps> = ({ onSubmitLabel = 'Submit' }) => {
  const dispatch = useAppDispatch()
  const { status: modal } = useReduxModal()
  const { claiming, releaseHold } = useSlotHoldContext()

  return (
    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <Button
        type="submit"
        disabled={modal === 'busy' || claiming}
        className="bg-primary-400 hover:bg-primary-500 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 sm:ml-3 sm:w-auto"
      >
        {modal === 'busy' ? (
          <>
            {booking.flow.submitting} <Spinner className="ml-2" />
          </>
        ) : claiming ? (
          <>
            {booking.flow.securingSlot} <Spinner className="ml-2" />
          </>
        ) : (
          onSubmitLabel
        )}
      </Button>
      <Button
        type="button"
        className="mt-3 inline-flex w-full justify-center rounded-md bg-surface-50 px-3 py-2 text-sm font-semibold text-accent-900 shadow-sm ring-1 ring-accent-300 ring-inset focus:bg-surface-200 sm:mt-0 sm:w-auto"
        onClick={() => {
          releaseHold()
          dispatch(setModal({ status: 'closed' }))
        }}
      >
        {booking.flow.cancel}
      </Button>
    </div>
  )
}

export default BookingFormActions
