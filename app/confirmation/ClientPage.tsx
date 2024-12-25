"use client"

import clsx from "clsx"
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxFormData,
} from "../hooks"
import { formatLocalDate, formatLocalTime } from "@/lib/availability/helpers"
import BookSessionButton from "@/components/BookSessionButton"
import { BookedCard } from "@/components/BookedCard"

export default function Confirmation() {
  const { selectedTime, timeZone } = useReduxAvailability()

  let dateString = ""
  let startString = ""
  let endString = ""

  if (selectedTime) {
    dateString = formatLocalDate(selectedTime.start, { timeZone })
    startString = formatLocalTime(selectedTime.start, { timeZone })
    endString = formatLocalTime(selectedTime.end, {
      timeZone,
      timeZoneName: "shortGeneric",
    })
  }
  const {
    firstName,
    lastName,
    location,
    phone,
    email
  } = useReduxFormData()

  const BookedData = {
    dateString: dateString!,
    startString: startString!,
    endString: endString!,
    state: "Pending" as "Pending",
    firstName: firstName!,
    lastName: lastName!,
    location: location!,
    phone: phone!,
    email: email!
  };

  return (
    <>
      <div className="py-4 sm:py-8 sm:px-0 px-4 w-full max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-primary-500 dark:text-primary-400 sm:text-5xl">
          Thanks!
        </h1>
        <p className="mt-6 text-xl text-gray-800 dark:text-gray-200 font-medium">
          Your request has been received!
        </p>
        <p className="mt-6 text-xl text-gray-800 dark:text-gray-200 font-medium">
          I&apos;ll review the appointment and get back to you shortly!
        </p>
      </div>
      <BookedCard {...BookedData} />

      <div className="pt-12 flex flex-grow items-center justify-center">
        <BookSessionButton title="Book Another Session!" href="/" />
      </div>
    </>
  )
}
