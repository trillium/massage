import React from 'react'

interface BookingSummaryProps {
  dateString: string
  startString: string
  endString: string
  price?: string | number
  acceptingPayment: boolean
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  dateString,
  startString,
  endString,
  price,
  acceptingPayment,
}) => (
  <div className="mb-4 mt-3 rounded-md border-l-4 border-l-primary-400 bg-primary-50/30 p-3 dark:bg-primary-50/10">
    <p className="text-sm font-semibold text-primary-800 dark:text-primary-400 md:text-base">
      {dateString}
    </p>
    <p className="text-xs md:text-sm">
      {startString} - {endString}
    </p>
    {acceptingPayment && <p className="text-xs md:text-sm">${price}</p>}
  </div>
)

export default BookingSummary
