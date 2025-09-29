import clsx from 'clsx'

export function BookedCard({
  dateString,
  startString,
  endString,
  firstName,
  lastName,
  location,
  phone,
  email,
  state,
  price,
  duration,
  promo,
  bookingUrl,
  hotelRoomNumber,
  parkingInstructions,
  additionalNotes,
}: {
  dateString: string
  startString: string
  endString: string
  firstName: string
  lastName: string
  location: string
  phone: string
  email: string
  state?: 'Pending' | 'Confirmed' | 'Declined'
  price?: number | string
  duration: number | string
  promo?: string
  bookingUrl?: string
  hotelRoomNumber?: string
  parkingInstructions?: string
  additionalNotes?: string
}) {
  const cards = [
    { title: 'Name', text: `${firstName} ${lastName}`, emphasize: true },
    { title: 'Location', text: location, emphasize: false },
    { title: 'Phone', text: phone, emphasize: false },
    { title: 'Email', text: email, emphasize: false },
    ...(promo ? [{ title: 'Promo', text: promo, emphasize: false }] : []),
    ...(hotelRoomNumber ? [{ title: 'Room', text: hotelRoomNumber, emphasize: false }] : []),
    ...(parkingInstructions
      ? [{ title: 'Parking', text: parkingInstructions, emphasize: false }]
      : []),
    ...(additionalNotes ? [{ title: 'Notes', text: additionalNotes, emphasize: false }] : []),
    ...(bookingUrl
      ? [
          {
            title: 'Source',
            text:
              (typeof window !== 'undefined' ? window.location.host : 'trilliummassage.la') +
              bookingUrl,
            emphasize: false,
          },
        ]
      : []),
  ]
  return (
    <div
      className={clsx(
        'flex h-full w-full items-center justify-center rounded-3xl max-xl:mx-auto max-xl:max-w-3xl max-lg:py-0',
        'border-primary-400 border-2 bg-gray-100 dark:bg-slate-900'
      )}
    >
      <div className="relative h-full w-full flex-grow p-2">
        <div className="border-l-primary-400 bg-primary-50/30 dark:bg-primary-50/10 relative mt-3 mb-4 rounded-md border-l-4 p-3">
          <div className="flex w-full flex-row items-center justify-between">
            <div>
              <p className="text-primary-800 dark:text-primary-400 text-base font-semibold md:text-lg">
                {dateString}
                {duration && ` - ${duration}m Massage`}
              </p>
              <p className="text-sm md:text-base">
                {startString} - {endString}
              </p>
              {price && <p className="text-base">${price}</p>}
            </div>
            <p className="text-base font-bold md:text-xl">{state}</p>
          </div>
        </div>
        {cards.map((item) => (
          <CardItem {...item} key={item.title} />
        ))}
      </div>
    </div>
  )
}

function CardItem({ title, text, emphasize = false }) {
  return (
    <p className="flex flex-row items-baseline bg-none pl-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
      <span
        className={clsx(
          'text-primary-500 dark:text-primary-400 inline-block min-w-24 text-sm tracking-wide uppercase',
          { 'font-bold': emphasize }
        )}
      >
        {title}:
      </span>
      <span className={clsx({ 'text-lg font-bold': emphasize })}>{text}</span>
    </p>
  )
}
