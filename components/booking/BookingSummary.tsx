import React from 'react'
import { DiscountType } from '@/lib/types'
import { GeneratePrice } from '@/components/ui/atoms/GeneratePriceAtom'
import { TextBaseSemibold, TextSmSemibold, TextXs, TextXsMedium } from '@/components/ui/text'
import { BookingFormData } from '@/lib/types'
import { flattenLocation } from '@/lib/helpers/locationHelpers'
import { validatePromoCode } from '@/lib/promoCodes'
import bookingData from '@/data/booking.json'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface BookingSummaryProps {
  dateString: string
  startString: string
  endString: string
  price?: string | number
  pricingLabel?: string
  acceptingPayment: boolean
  discount?: DiscountType | null
  formData?: BookingFormData
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  dateString,
  startString,
  endString,
  price,
  pricingLabel,
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
    <Box variant="accentCard" className="mt-3 mb-4">
      <Stack direction="row" align="start" justify="between">
        <Box>
          <TextSmSemibold className="md:text-base">{dateString}</TextSmSemibold>
          <TextXs className="md:text-sm">
            {startString}
            {bookingData.summary.timeSeparator}
            {endString}
          </TextXs>
        </Box>
        {acceptingPayment ? (
          <Box className="ml-4 min-w-[60px] text-right">
            <TextBaseSemibold as="span" status="primary">
              <GeneratePrice price={Number(price)} discount={discount} />
            </TextBaseSemibold>
          </Box>
        ) : pricingLabel ? (
          <Box className="ml-4 text-right">
            <TextXs status="primary" className="md:text-sm">
              {pricingLabel}
            </TextXs>
          </Box>
        ) : null}
      </Stack>
      <Stack className="mt-1" direction="row" align="start">
        <TextXsMedium as="span" status="subtle" className="w-18 shrink-0 md:text-sm">
          {bookingData.summary.clientLabel}
        </TextXsMedium>
        <TextXs as="span" status="subtle" className="break-words md:text-sm">
          {clientName || (
            <TextXs as="span" status="muted" className="italic">
              {bookingData.summary.clientPlaceholder}
            </TextXs>
          )}
        </TextXs>
      </Stack>
      {promoLine && (
        <Stack className="mt-1" direction="row" align="start">
          <TextXsMedium as="span" status="primary" className="md:text-sm">
            {bookingData.summary.promoCheckmark} {promoLine}
          </TextXsMedium>
        </Stack>
      )}
      <Stack direction="row" align="start">
        <TextXsMedium as="span" status="subtle" className="w-18 shrink-0 md:text-sm">
          {bookingData.summary.locationLabel}
        </TextXsMedium>
        <TextXs as="span" status="subtle" className="break-words md:text-sm">
          {location || (
            <TextXs as="span" status="muted" className="italic">
              {bookingData.summary.locationPlaceholder}
            </TextXs>
          )}
          {formData?.hotelRoomNumber && (
            <TextXs as="span" status="subtle" className="md:text-sm">
              {bookingData.summary.roomPrefix}
              {formData.hotelRoomNumber}
            </TextXs>
          )}
        </TextXs>
      </Stack>
    </Box>
  )
}

export default BookingSummary
