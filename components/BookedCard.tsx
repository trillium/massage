import clsx from 'clsx'
import { siteConfig } from '@/lib/siteConfig'
import ui from '@/data/ui.json'
import { TextBase, TextSm,
  TextLg,
} from '@/components/ui/text'

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
    { title: ui.bookedCard.name, text: `${firstName} ${lastName}`, emphasize: true },
    { title: ui.bookedCard.location, text: location, emphasize: false },
    { title: ui.bookedCard.phone, text: phone, emphasize: false },
    { title: ui.bookedCard.email, text: email, emphasize: false },
    ...(promo ? [{ title: ui.bookedCard.promo, text: promo, emphasize: false }] : []),
    ...(hotelRoomNumber
      ? [{ title: ui.bookedCard.room, text: hotelRoomNumber, emphasize: false }]
      : []),
    ...(parkingInstructions
      ? [{ title: ui.bookedCard.parking, text: parkingInstructions, emphasize: false }]
      : []),
    ...(additionalNotes
      ? [{ title: ui.bookedCard.notes, text: additionalNotes, emphasize: false }]
      : []),
    ...(bookingUrl
      ? [
          {
            title: ui.bookedCard.source,
            text:
              (typeof window !== 'undefined'
                ? window.location.host
                : new URL(siteConfig.domain.siteUrl).hostname) + bookingUrl,
            emphasize: false,
          },
        ]
      : []),
  ]
  return (
    <div
      className={clsx(
        'flex h-full w-full items-center justify-center rounded-3xl max-xl:mx-auto max-xl:max-w-3xl max-lg:py-0',
        'border-primary-400 border-2 bg-surface-200 dark:bg-surface-900'
      )}
    >
      <div className="relative h-full w-full flex-grow p-2">
        <div className="border-l-primary-400 bg-primary-50/30 dark:bg-primary-50/10 relative mt-3 mb-4 rounded-md border-l-4 p-3">
          <div className="flex w-full flex-row items-center justify-between">
            <div>
              <TextLg className="text-primary-800 dark:text-primary-400 text-base font-semibold md:text-lg">
                {dateString}
                {duration && ` - ${duration}${ui.bookedCard.massageLabel}`}
              </TextLg>
              <TextSm className="md:text-base">
                {startString}
                {ui.bookedCard.separator}
                {endString}
              </TextSm>
              {price && (
                <TextBase>
                  {ui.bookedCard.currencySymbol}
                  {price}
                </TextBase>
              )}
            </div>
            <TextBase className="md:text-xl">{state}</TextBase>
          </div>
        </div>
        {cards.map((item) => (
          <CardItem {...item} key={item.title} />
        ))}
      </div>
    </div>
  )
}

function CardItem({
  title,
  text,
  emphasize = false,
}: {
  title: string
  text: string
  emphasize?: boolean
}) {
  return (
    <TextLg className="flex flex-row items-baseline bg-none pl-4 text-lg font-semibold text-accent-700 dark:text-accent-300">
      <span
        className={clsx(
          'text-primary-500 dark:text-primary-400 inline-block min-w-24 text-sm tracking-wide uppercase',
          { 'font-bold': emphasize }
        )}
      >
        {title}
        {ui.bookedCard.titleSeparator}
      </span>
      <span className={clsx({ 'text-lg font-bold': emphasize })}>{text}</span>
    </TextLg>
  )
}
