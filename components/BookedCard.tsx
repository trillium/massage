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
}) {
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
            </div>
            <p className="text-base font-bold md:text-xl">{state}</p>
          </div>
        </div>
        <p className="bg-none pl-4 text-lg font-bold text-gray-700 dark:text-gray-100">
          {firstName} {lastName}
        </p>
        <p className="bg-none pl-6 text-base font-bold  text-gray-500 dark:text-gray-300">
          {location}
        </p>
        <p className="bg-none pl-6 text-base font-bold  text-gray-500 dark:text-gray-300">
          {phone}
        </p>
        <p className="bg-none pl-6 text-base font-bold  text-gray-500 dark:text-gray-300">
          {email}
        </p>
      </div>
    </div>
  )
}
