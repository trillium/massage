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
}) {
  const cards = [
    { title: 'Name', text: `${firstName} ${lastName}`, emphasize: true },
    { title: 'Location', text: location, emphasize: false },
    { title: 'Phone', text: phone, emphasize: false },
    { title: 'Email', text: email, emphasize: false },
  ]
  return (
    <div
      className={clsx(
        'flex h-full w-full items-center justify-center rounded-3xl max-xl:mx-auto max-xl:max-w-3xl max-lg:py-0',
        'border-2 border-primary-400 bg-gray-100 dark:bg-slate-900'
      )}
    >
      <div className="relative h-full w-full flex-grow p-2">
        <div className="relative mb-4 mt-3 rounded-md border-l-4 border-l-primary-400 bg-primary-50/30 p-3 dark:bg-primary-50/10">
          <div className="flex w-full flex-row items-center justify-between">
            <div>
              <p className="text-base font-semibold text-primary-800 dark:text-primary-400 md:text-lg">
                {dateString}
              </p>
              <p className="text-sm md:text-base">
                {startString} - {endString}
              </p>
              {price && <p className="text-base ">${price}</p>}
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
  console.log(title, text, emphasize)
  return (
    <p className="flex flex-row items-baseline bg-none pl-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
      <span
        className={clsx(
          'inline-block min-w-24 text-sm uppercase tracking-wide text-primary-500 dark:text-primary-400',
          { 'font-bold': emphasize }
        )}
      >
        {title}:
      </span>
      <span className={clsx({ 'text-lg font-bold': emphasize })}>{text}</span>
    </p>
  )
}
