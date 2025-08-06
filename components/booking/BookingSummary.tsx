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
  <div className="border-l-primary-400 bg-primary-50/30 dark:bg-primary-50/10 mt-3 mb-4 rounded-md border-l-4 p-3">
    <p className="text-primary-800 dark:text-primary-400 text-sm font-semibold md:text-base">
      {dateString}
    </p>
    <p className="text-xs md:text-sm">
      {startString} - {endString}
    </p>
    {acceptingPayment && <p className="text-xs md:text-sm">${price}</p>}
  </div>
)

export default BookingSummary
