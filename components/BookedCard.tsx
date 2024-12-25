import clsx from "clsx"

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
  state: "Pending" | "Confirmed" | "Declined"
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center h-full max-lg:py-0 rounded-3xl w-full max-xl:max-w-3xl max-xl:mx-auto",
        "bg-gray-100 dark:bg-slate-900 border-2 border-primary-400"
      )}>
      <div className="w-full h-full relative flex-grow p-2">
        <div className="border-l-4 relative border-l-primary-400 bg-primary-50/30 dark:bg-primary-50/10 p-3 mt-3 mb-4 rounded-md">
          <div className="flex w-full flex-row justify-between items-center">
            <div>
              <p className="text-base md:text-lg font-semibold text-primary-800 dark:text-primary-400">
                {dateString}
              </p>
              <p className="text-sm md:text-base">
                {startString} - {endString}
              </p>
            </div>
            <p className="text-base md:text-xl font-bold">{state}</p>
          </div>
        </div>
        <p className="pl-4 bg-none font-bold text-lg text-gray-700 dark:text-gray-100">
          {firstName} {lastName}
        </p>
        <p className="pl-6 bg-none font-bold text-base  text-gray-500 dark:text-gray-300">
          {location}
        </p>
        <p className="pl-6 bg-none font-bold text-base  text-gray-500 dark:text-gray-300">
          {phone}
        </p>
        <p className="pl-6 bg-none font-bold text-base  text-gray-500 dark:text-gray-300">
          {email}
        </p>
      </div>
    </div>
  )
}