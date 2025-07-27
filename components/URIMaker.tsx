import React, { useState } from 'react'
import type { FormEvent, Dispatch, SetStateAction } from 'react'

import Spinner from '@/components/Spinner'

import { setModal } from '@/redux/slices/modalSlice'
import { useAppDispatch, useReduxModal } from '@/redux/hooks'
import { encode } from '@/lib/hashServer'
import { createURI } from '@/lib/uri'
import DurationPicker from './availability/controls/DurationPicker'
import type { GoogleCalendarV3Event } from '@/lib/types'
import { DEFAULT_PRICING } from 'config'

type URIMakerProps = { events: GoogleCalendarV3Event[] }

export default function URIMaker({ events }: URIMakerProps) {
  const [hash, setHash] = useState('')
  const { status: modal } = useReduxModal()
  const [state, setState] = useState({
    firstName: '',
    lastName: '',
    start: '',
    end: '',
  })
  const dispatchRedux = useAppDispatch()

  let uriEncoded = ''
  if (hash !== '') {
    const result = createURI({ ...state, hash })
    if (result) {
      uriEncoded = result.uri
    }
  }

  const handleSetStartEnd = ({ start, end }: { start: string; end: string }) => {
    const newState = { ...state, start, end }
    setState(newState)
    const formElement = document.getElementById('URIMakerForm')
    if (formElement) {
      formElement.scrollIntoView()
      formElement.focus()
    }
  }

  const formOnChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
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
        console.error('Failed to copy: ', err)
      })
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 md:px-5 lg:px-0">
        {/* <DurationPicker title="Select a time" duration={90} price={DEFAULT_PRICING} /> */}
        <div className="mb-11 grid grid-cols-12">
          <form
            id="URIMakerForm"
            className={'mt-3 w-full sm:mt-0' + ' ' + 'col-span-12 xl:col-span-7'}
            onSubmit={(event) => {
              handleSubmit(event, setHash)
            }}
          >
            <div className="flex flex-col space-y-4">
              <div className="isolate -space-y-px rounded-md shadow-sm">
                <div className="row relative flex px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
                  <div className="mx-1 w-full">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      First Name
                    </label>
                    <input
                      aria-label="Name"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="family-name"
                      required
                      aria-required
                      name="firstName"
                      id="firstName"
                      value={state.firstName}
                      placeholder="First"
                      onChange={formOnChange}
                      className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-base sm:leading-6"
                    />
                  </div>
                  <div className="mx-1 w-full">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Last Name
                    </label>
                    <input
                      aria-label="Name"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="given-name"
                      required
                      aria-required
                      name="lastName"
                      id="lastName"
                      value={state.lastName}
                      placeholder="Last"
                      onChange={formOnChange}
                      className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-base sm:leading-6"
                    />
                  </div>
                </div>

                <div className="row relative flex px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2 focus-within:ring-primary-400">
                  <div className="mx-1 w-full">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Start
                    </label>
                    <input
                      aria-label="start"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="family-name"
                      required
                      aria-required
                      name="start"
                      id="start"
                      value={state.start}
                      placeholder="start datetime"
                      onChange={formOnChange}
                      className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-base sm:leading-6"
                    />
                  </div>
                  <div className="mx-1 w-full">
                    <label
                      htmlFor="end"
                      className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
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
                      className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-base sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
            {modal === 'error' && (
              <div className="bg-red-50 text-red-600">
                There was an error submitting your request.
              </div>
            )}
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={modal === 'busy'}
                className="inline-flex w-full justify-center rounded-md bg-primary-400 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-500 disabled:opacity-50 sm:ml-3 sm:w-auto"
              >
                {modal === 'busy' ? (
                  <>
                    Submitting ... <Spinner className="ml-2" />
                  </>
                ) : (
                  <>Submit</>
                )}
              </button>
              <button
                type="button"
                className="hocus:bg-gray-100 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                onClick={() => {
                  dispatchRedux(setModal({ status: 'closed' }))
                }}
              >
                Cancel
              </button>
            </div>
          </form>
          <div
            className={
              'w-full rounded-xl border-2 border-primary-400 bg-slate-100 dark:bg-slate-900 ' +
              'ml-0 mt-8 p-8 xl:ml-8 xl:mt-0 ' +
              'col-span-12 xl:col-span-5 '
            }
          >
            <div className="w-full p-4">
              <pre>{JSON.stringify(state, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleCopyToClipboard} className="flex w-full flex-row items-end">
        <div className="flex-1">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900 dark:text-gray-100"
          >
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
            className="border-secondary-500 block w-full flex-1 rounded-md border-2 p-0 pl-2 pt-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 dark:text-gray-100 sm:text-base sm:leading-6"
          />
        </div>
        <button
          type="submit"
          className="ml-2 h-8  rounded-md bg-primary-500 px-4 font-bold text-white"
        >
          Copy
        </button>
      </form>
      <div className="pt-4">
        <ul>
          {events.map((item: GoogleCalendarV3Event) => {
            return <CalendarEvent key={item.id} {...item} handleSetStartEnd={handleSetStartEnd} />
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
async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setUri: Dispatch<SetStateAction<string>>
) {
  event.preventDefault()
  const jsonData = Object.fromEntries(new FormData(event.currentTarget))
  const uriData = await encode(jsonData)
  const { key: hash } = uriData
  setUri(hash as string)
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
  const startDateTime = new Date(start.dateTime).toLocaleString('en-US', {
    timeZone: start.timeZone,
  })
  const endDateTime = new Date(end.dateTime).toLocaleString('en-US', {
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
        className="m-4 rounded-md border border-primary-400 px-4 py-2 hover:bg-primary-400 hover:font-bold  "
        onClick={() => handleSetStartEnd({ start: start.dateTime, end: end.dateTime })}
      >
        Set Start/End
      </button>
    </li>
  )
}
