import React from 'react'
import Spinner from 'components/Spinner'
import { setModal } from '@/redux/slices/modalSlice'
import { useAppDispatch, useReduxModal } from '@/redux/hooks'

interface BookingFormActionsProps {
  onSubmitLabel?: string
}

const BookingFormActions: React.FC<BookingFormActionsProps> = ({ onSubmitLabel = 'Submit' }) => {
  const dispatchRedux = useAppDispatch()
  const { status: modal } = useReduxModal()

  return (
    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      <button
        type="submit"
        disabled={modal === 'busy'}
        className="bg-primary-400 hover:bg-primary-500 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 sm:ml-3 sm:w-auto"
      >
        {modal === 'busy' ? (
          <>
            Submitting ... <Spinner className="ml-2" />
          </>
        ) : (
          <>{onSubmitLabel}</>
        )}
      </button>
      <button
        type="button"
        className="hocus:bg-gray-100 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset sm:mt-0 sm:w-auto"
        onClick={() => {
          dispatchRedux(setModal({ status: 'closed' }))
        }}
      >
        Cancel
      </button>
    </div>
  )
}

export default BookingFormActions
