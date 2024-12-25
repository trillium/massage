"use client"

import type { InferGetServerSidePropsType } from "next"
import clsx from 'clsx';
import 'wicg-inert';

import AvailabilityPicker from "@/components/availability/AvailabilityPicker"
import { PricingWrapper } from "@/components/availability/PricingWrapper"
import { DEFAULT_PRICING } from "@/config"

import PageProps from "@/app/page"
import { AllowedDurationsType } from "@/lib/types"
import { useEffect, useRef, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"

import BookingForm from "@/components/booking/BookingForm"

const pricing = DEFAULT_PRICING

// Need to refactor fetchData so it's easier to extend to other pages
const possibleDurations = [15, 30, 45, 60]

const paymentOptionsList = [
  "Massage session block prepaid in full",
  "Split individual booking fees with client",
  "Individuals pay for their own sessions",
] // These need more explanation

const allowedDurations: AllowedDurationsType = [
  60 * 1,
  60 * 1.5,
  60 * 2,
  60 * 2.5,
  60 * 3,
  60 * 3.5,
  60 * 4,
]

const OnsiteSchema = Yup.object().shape({
  eventName: Yup.string().max(60, "Too Long!").required("Required"),
  allowedDurations: Yup.array()
    .of(Yup.number())
    .min(1, "At least one duration must be selected.")
    .required("Required"),
  paymentOptions: Yup.string().required("Required"),
})

function ClientPage({
  start,
  end,
  busy,
  selectedDate,
  duration,
}: InferGetServerSidePropsType<typeof PageProps>) {
  const { slots, pickerProps } = PricingWrapper({
    start,
    end,
    busy,
    pricing,
    selectedDate,
    duration,
    allowedDurations,
  })

  const formik = useFormik({
    initialValues: {
      eventName: "",
      eventBaseString: "__EVENT__",
      eventContainerString: "__EVENT__CONTAINER__",
      allowedDurations: [] as number[],
      pricing: {
        15: (120 * 1) / 4,
        30: (120 * 2) / 4,
        45: (120 * 3) / 4,
        60: (120 * 4) / 4,
      },
      paymentOptions: "",
      leadTime: 0,
    },
    validationSchema: OnsiteSchema,
    onSubmit: (values) => {
      console.log(values)
    },
  })

  const [pathString, setPathString] = useState("")

  const formCheckboxOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    const allowedDurations: number[] = formik.values.allowedDurations

    const newDurations = allowedDurations.includes(value)
      ? allowedDurations.filter((duration) => duration !== value)
      : [...allowedDurations, value]

    setFieldValue("allowedDurations", newDurations)
  }

  const { eventName } = formik.values
  const { setFieldValue } = formik

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current) {
      if (!formik.isValid) {
        divRef.current.setAttribute('inert', 'true');
      } else {
        divRef.current.removeAttribute('inert');
      }
    }
  }, [formik.isValid]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sanitizedName =
        eventName
          .replace(/\s|-/g, "_")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "") || "your_name_here"
      const newPathString = window.location.origin + "/" + sanitizedName
      setPathString(newPathString)
      setFieldValue("eventBaseString", sanitizedName + "__EVENT__")
      setFieldValue("eventContainerString", sanitizedName + "__EVENT__CONTAINER__")
    }
  }, [eventName, setFieldValue])

  return (
    <>
      <div className="w-full flex justify-center items-center align-middle">
        <h2 className="text-lg py-2 font-bold text-primary-500 dark:text-primary-400">
          Your link: {pathString}
        </h2>
      </div>
      <form onBlur={formik.handleBlur}>
        <ol>
          <label
            htmlFor="eventName"
            className="block text-xl font-semibold text-gray-900 dark:text-gray-100">
            Let&rsquo;s pick a name for your booking:
          </label>
          <input
            aria-label="Event Name"
            type="text"
            name="eventName"
            id="eventName"
            value={formik.values.eventName}
            onChange={formik.handleChange}
            className="pl-2 py-1 block w-full p-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 mb-1 dark:border-white border-slate-100 border-2 rounded-md"
            placeholder="e.g., WeWork Playa Vista"
            maxLength={60}
            required
            aria-required
          />
          <div className="text-red-600 text-sm min-h-[1.25rem]">{formik.touched.eventName && formik.errors.eventName || " "}</div>

          <label
            htmlFor="sessionDuration"
            className="pt-4 block text-xl font-semibold text-gray-900 dark:text-gray-100">
            How long should sessions be?
          </label>
          <div className="pl-4 flex flex-col space-y-2">
            <fieldset onBlur={formik.handleBlur('allowedDurations')}>
              {possibleDurations.map((duration) => (
                <div className="flex items-center" key={duration}>
                  <input
                    checked={formik.values.allowedDurations.includes(duration)}
                    id={`checked-checkbox-${duration}`}
                    type="checkbox"
                    value={duration}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    onChange={formCheckboxOnChange}
                    required
                    aria-required
                  />
                  <label
                    htmlFor={`checked-checkbox-${duration}`}
                    className="ms-2 font-medium">
                    {duration} minutes
                  </label>
                </div>
              ))}
            </fieldset>
            <div className="text-red-600 text-sm min-h-[1.25rem]">
              {formik.touched.allowedDurations && formik.errors.allowedDurations || " "}
            </div>
          </div>

          <label
            htmlFor="sessionDuration"
            className="pt-4 block text-xl font-semibold text-gray-900 dark:text-gray-100">
            Payment options
          </label>
          <div className="pl-4 flex flex-col space-y-2">
            {paymentOptionsList.map((option) => (
              <div className="flex items-center" key={option}>
                <input
                  id={`checked-checkbox-${option}`}
                  type="radio"
                  name="paymentOptions"
                  value={option}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  onChange={formik.handleChange}
                  required
                />
                <label
                  htmlFor={`checked-checkbox-${option}`}
                  className="ms-2 font-medium">
                  {option}
                </label>
              </div>
            ))}
            <div className="text-red-600 text-sm min-h-[1.25rem]">{formik.touched.paymentOptions && formik.errors.paymentOptions || " "}</div>
          </div>
        </ol>
      </form>
      <div className={clsx({
        'pointer-events-none opacity-50': !formik.isValid,
      })}
        aria-disabled={!formik.isValid}
        tabIndex={!formik.isValid && -1 || undefined}
        ref={divRef}

      >
        <AvailabilityPicker slots={slots} pickerProps={pickerProps}>
          <BookingForm
            additionalData={formik.values}
            endPoint="api/onsite/request"
          />
        </AvailabilityPicker>
      </div>     
    </>
  )
}

export default ClientPage
