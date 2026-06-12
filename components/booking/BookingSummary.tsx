import React from 'react'
import { DiscountType } from '@/lib/types'
import { GeneratePrice } from '@/components/ui/atoms/GeneratePriceAtom'
import { BookingFormData } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { validatePromoCode } from '@/lib/promoCodes'
import bookingData from '@/data/booking.json'

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

  const location = formData?.location ? flattenLocation(formData.location) : ''

  const appliedPromo = formData?.promo ? validatePromoCode(formData.promo) : null
  const promoLine =
    appliedPromo?.discount.type === 'minutes'
      ? `+${appliedPromo.discount.bonusMinutes} min upgrade`
      : null

  return (
    <div className="border-l-primary-400 dark:bg-primary-50/10 mt-3 mb-4 rounded-md border-l-4 bg-surface-50 p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary-800 dark:text-primary-400 text-sm font-semibold md:text-base">
            {dateString}
          </p>
          <p className="text-xs md:text-sm">
            {startString}
            {bookingData.summary.timeSeparator}
            {endString}
          </p>
        </div>
        {acceptingPayment && (
          <div className="text-primary-800 dark:text-primary-400 ml-4 min-w-[60px] text-right text-base font-semibold">
            <GeneratePrice price={Number(price)} discount={discount} />
          </div>
        )}
      </div>
      <div className="mt-1 flex items-start text-xs text-accent-700 md:text-sm dark:text-accent-300">
        <span className="w-18 shrink-0 font-medium">{bookingData.summary.clientLabel}</span>
        <span className="break-words">
          {clientName || (
            <span className="text-accent-400 italic dark:text-accent-500">
              {bookingData.summary.clientPlaceholder}
            </span>
          )}
        </span>
      </div>
      {promoLine && (
        <div className="mt-1 flex items-start text-xs text-primary-600 md:text-sm dark:text-primary-400">
          <span className="font-medium">
            {bookingData.summary.promoCheckmark} {promoLine}
          </span>
        </div>
      )}
      <div className="flex items-start text-xs text-accent-700 md:text-sm dark:text-accent-300">
        <span className="w-18 shrink-0 font-medium">{bookingData.summary.locationLabel}</span>
        <span className="break-words">
          {location || (
            <span className="text-accent-400 italic dark:text-accent-500">
              {bookingData.summary.locationPlaceholder}
            </span>
          )}
          {formData?.hotelRoomNumber && (
            <span>
              {bookingData.summary.roomPrefix}
              {formData.hotelRoomNumber}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

export default BookingSummary
