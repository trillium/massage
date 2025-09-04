import React from 'react'
import { DiscountType } from '@/lib/types'
import { GeneratePrice } from '@/components/ui/atoms/GeneratePriceAtom'
import { BookingFormData } from './types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

interface BookingSummaryProps {
  dateString: string
  startString: string
  endString: string
  price?: string | number
  acceptingPayment: boolean
  discount?: DiscountType | null
  formData?: BookingFormData
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  dateString,
  startString,
  endString,
  price,
  acceptingPayment,
  discount,
  formData,
}) => {
  // Format client name
  const clientName =
    formData?.firstName || formData?.lastName
      ? `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
      : ''

  // Format location
  const location = formData?.location ? flattenLocation(formData.location) : ''

  return (
    <div className="border-l-primary-400 dark:bg-primary-50/10 mt-3 mb-4 rounded-md border-l-4 bg-white p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-800 dark:text-primary-400 text-sm font-semibold md:text-base">
            {dateString}
          </p>
          <p className="text-xs md:text-sm">
            {startString} - {endString}
          </p>
        </div>
        {acceptingPayment && (
          <div className="text-primary-800 dark:text-primary-400 ml-4 min-w-[60px] text-right text-base font-semibold">
            <GeneratePrice price={Number(price)} discount={discount} />
          </div>
        )}
      </div>
      <div className="mt-1 flex items-start text-xs text-gray-700 md:text-sm dark:text-gray-300">
        <span className="w-18 shrink-0 font-medium">Client:&nbsp;</span>
        <span className="break-words">
          {clientName || (
            <span className="text-gray-400 italic dark:text-gray-500">(enter name below)</span>
          )}
        </span>
      </div>
      <div className="flex items-start text-xs text-gray-700 md:text-sm dark:text-gray-300">
        <span className="w-18 shrink-0 font-medium">Location:&nbsp;</span>
        <span className="break-words">
          {location || (
            <span className="text-gray-400 italic dark:text-gray-500">(enter location below)</span>
          )}
          {formData?.hotelRoomNumber && <span>, Room: #{formData.hotelRoomNumber}</span>}
        </span>
      </div>
    </div>
  )
}

export default BookingSummary
