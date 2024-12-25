import React, { useState } from "react"
import type { FormEvent } from "react"

import Spinner from "@/components/Spinner"

import { setModal } from "@/redux/slices/modalSlice"
import { useAppDispatch, useReduxModal } from "@/app/hooks"
import { encode } from "@/lib/hashServer"
import { createURI } from "@/lib/uri"
import DurationPicker from "./availability/controls/DurationPicker"
import type { GoogleCalendarV3Event } from "@/lib/types"

type URIMakerProps = { events: GoogleCalendarV3Event[] }

export default function URIMaker({ events }: URIMakerProps) {
  const [hash, setHash] = useState("")
  const { status: modal } = useReduxModal()
  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    start: "",
    end: "",
  })
  const dispatchRedux = useAppDispatch()

  let uriEncoded = ""
  if (hash !== "") {
    const { uri } = createURI({ ...state, hash })
    uriEncoded = uri
  }

  const handleSetStartEnd = ({
    start,
    end,
  }: {
    start: string
    end: string
  }) => {
    const newState = { ...state, start, end }
    setState(newState)
    const formElement = document.getElementById("URIMakerForm")
    if (formElement) {
      formElement.scrollIntoView()
      formElement.focus()
    }
  }

  const formOnChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = event.target as HTMLInputElement
    setState({ ...state, [target.name]: target.value })
  }

  const handleCopyToClipboard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigator.clipboard
      .writeText(uriEncoded)
      .then(() => {})
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <>
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-0 mx-auto">
        <DurationPicker title="Select a time" />
        <div className="grid grid-cols-12 mb-11">
          <form
            id="URIMakerForm"
            className={
              "mt-3 sm:mt-0 w-full" + " " + "col-span-12 xl:col-span-7"
            }
            onSubmit={(event) => {
              handleSubmit(event, setHash)
            }}>
            <div className="flex flex-col space-y-4">
              <div className="isolate -space-y-px rounded-md shadow-sm">
                <div className="last:rounded-t-none first:rounded-b-none last:rounded-md first:rounded-md relative px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400 flex row">
                  <div className="w-full mx-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      First Name
                    </label>
                    <input
                      aria-label="Name"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="firstName"
                      required
                      aria-required
                      name="firstName"
                      id="firstName"
                      value={state.firstName}
                      placeholder="First"
                      onChange={formOnChange}
                      className="pl-2 py-1 block w-full border-0 p-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 mb-1"
                    />
                  </div>
                  <div className="w-full mx-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Last Name
                    </label>
                    <input
                      aria-label="Name"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="lastName"
                      required
                      aria-required
                      name="lastName"
                      id="lastName"
                      value={state.lastName}
                      placeholder="Last"
                      onChange={formOnChange}
                      className="pl-2 py-1 block w-full border-0 p-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 mb-1"
                    />
                  </div>
                </div>

                <div className="last:rounded-t-none first:rounded-b-none last:rounded-md first:rounded-md relative px-3 pt-2.5 pb-1.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400 flex row">
                  <div className="w-full mx-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Start
                    </label>
                    <input
                      aria-label="start"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="firstName"
                      required
                      aria-required
                      name="start"
                      id="start"
                      value={state.start}
                      placeholder="start datetime"
                      onChange={formOnChange}
                      className="pl-2 py-1 block w-full border-0 p-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 mb-1"
                    />
                  </div>
                  <div className="w-full mx-1">
                    <label
                      htmlFor="end"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      End
                    </label>
                    <input
                      aria-label="End"
                      type="text"
                      required
                      aria-required
                      name="end"
                      id="end"
                      value={state.end}
                      placeholder="end datetime"
                      onChange={formOnChange}
                      className="pl-2 py-1 block w-full border-0 p-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 mb-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            {modal === "error" && (
              <div className="bg-red-50 text-red-600">
                There was an error submitting your request.
              </div>
            )}
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={modal === "busy"}
                className="inline-flex w-full justify-center rounded-md bg-primary-400 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50">
                {modal === "busy" ? (
                  <>
                    Submitting ... <Spinner className="ml-2" />
                  </>
                ) : (
                  <>Submit</>
                )}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hocus:bg-gray-100 sm:mt-0 sm:w-auto"
                onClick={() => {
                  dispatchRedux(setModal({ status: "closed" }))
                }}>
                Cancel
              </button>
            </div>
          </form>
          <div
            className={
              "w-full bg-slate-100 dark:bg-slate-900 rounded-xl border-2 border-primary-400 " +
              "p-8 xl:mt-0 mt-8 xl:ml-8 ml-0 " +
              "col-span-12 xl:col-span-5 "
            }>
            <div className="p-4 w-full">
              <pre>{JSON.stringify(state, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleCopyToClipboard}
        className="flex w-full flex-row items-end">
        <div className="flex-1">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            Hashed URI
          </label>
          <input
            aria-label="URI"
            type="text"
            required
            aria-required
            name="lastName"
            id="lastName"
            value={uriEncoded}
            placeholder="Hashed URI"
            readOnly
            className="pl-2 pt-1 block w-full rounded-md border-secondary-500 border-2 p-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 flex-1"
          />
        </div>
        <button
          type="submit"
          className="ml-2 px-4  font-bold bg-primary-500 text-white rounded-md h-8">
          Copy
        </button>
      </form>
      <div className="pt-4">
        <ul>
          {events.map((item: GoogleCalendarV3Event) => {
            return (
              <CalendarEvent
                key={item.id}
                {...item}
                handleSetStartEnd={handleSetStartEnd}
              />
            )
          })}
        </ul>
      </div>
    </>
  )
}

/**
 *
 * Handles form submissions by intercepting the native event,
 * passing params to the `/book` endpoint, and redirecting
 * upon success (or showing a failure message).
 *
 */
async function handleSubmit(event: FormEvent<HTMLFormElement>, setUri: any) {
  event.preventDefault()
  const jsonData = Object.fromEntries(new FormData(event.currentTarget))
  const uriData = await encode(jsonData)
  const { key: hash } = uriData
  setUri(hash)
  return
}

type CalendarEventProps = GoogleCalendarV3Event & {
  handleSetStartEnd: ({ start, end }: { start: string; end: string }) => void
}

function CalendarEvent({
  summary,
  description,
  start,
  end,
  location,
  handleSetStartEnd,
}: CalendarEventProps) {
  const startDateTime = new Date(start.dateTime).toLocaleString("en-US", {
    timeZone: start.timeZone,
  })
  const endDateTime = new Date(end.dateTime).toLocaleString("en-US", {
    timeZone: end.timeZone,
  })

  return (
    <li className="pb-2">
      <h3 className="font-bold text-primary-400">{summary}</h3>
      <div className="px-4">
        <p>{startDateTime}</p>
        <p>{endDateTime}</p>
        {location && <p>{location}</p>}
        {description && <p>{description}</p>}
      </div>
      <button
        className="px-4 py-2 border border-primary-400 rounded-md m-4 hover:bg-primary-400 hover:font-bold  "
        onClick={() =>
          handleSetStartEnd({ start: start.dateTime, end: end.dateTime })
        }>
        Set Start/End
      </button>
    </li>
  )
}
