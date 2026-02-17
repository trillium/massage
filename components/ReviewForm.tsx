import React from 'react'
import { useRouter } from 'next/navigation'

import Spinner from '@/components/Spinner'
import { formatLocalDate, formatLocalTime } from '@/lib/availability/helpers'

import { setReviewForm } from '@/redux/slices/reviewFormSlice'
import { setModal } from '@/redux/slices/modalSlice'
import {
  useAppDispatch,
  useReduxAvailability,
  useReduxReviewFormData,
  useReduxModal,
} from '@/redux/hooks'
import { ReviewSnippet } from './ReviewCard/ReviewSnippet'
import { Star } from './ReviewCard/Stars'
import { handleReviewSubmit } from './ReviewForm.handleSubmit'

export default function ReviewForm({
  error,
  start,
  end,
}: {
  error: string
  start: string
  end: string
}) {
  const dispatch = useAppDispatch()
  const reviewData = useReduxReviewFormData()
  const { firstName, lastName, rating, text } = reviewData
  const { status: modal } = useReduxModal()
  const { timeZone } = useReduxAvailability()

  const router = useRouter()

  const formOnChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = event.target as HTMLInputElement
    dispatch(setReviewForm({ [target.name]: target.value }))
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-0">
      <div className="mb-11 grid grid-cols-12">
        <form
          className={'mt-3 w-full sm:mt-0' + ' ' + 'col-span-12 xl:col-span-7'}
          onSubmit={(event) => {
            handleReviewSubmit(event, dispatch, router)
          }}
        >
          <div className="border-l-primary-400 bg-primary-100/30 dark:bg-primary-50/10 mt-3 mb-4 rounded-md border-l-4 p-3">
            <p className="text-primary-800 dark:text-primary-400 text-base font-semibold md:text-lg">
              {formatLocalDate(start, { timeZone })}
            </p>
            <p className="text-sm md:text-base">
              {formatLocalTime(start, { timeZone })} - {formatLocalTime(end, { timeZone })}
            </p>
          </div>

          <input type="hidden" readOnly name="source" value="Trillium Massage" />
          <input type="hidden" readOnly name="type" value="table" />
          <input type="hidden" readOnly name="date" value={start} />
          <input type="hidden" readOnly name="error" value={error} />

          <div className="flex flex-col space-y-4">
            <div className="isolate -space-y-px rounded-md shadow-sm">
              <div className="row focus-within:ring-primary-400 relative flex px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
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
                    autoComplete="given-name"
                    required
                    aria-required
                    name="firstName"
                    id="firstName"
                    value={firstName}
                    placeholder="First"
                    onChange={formOnChange}
                    className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-gray-100"
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
                    autoComplete="family-name"
                    required
                    aria-required
                    name="lastName"
                    id="lastName"
                    value={lastName}
                    placeholder="Last"
                    onChange={formOnChange}
                    className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-gray-100"
                  />
                </div>
              </div>
              <div className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Date
                </label>
                <input
                  aria-label="Phone Number"
                  required
                  autoComplete="tel"
                  aria-required
                  name="date"
                  id="date"
                  value={formatLocalDate(start, { timeZone })}
                  className="mb-1 block w-full border-0 bg-gray-400 p-0 py-1 pl-2 text-gray-900 select-none placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 dark:bg-gray-700 dark:text-gray-100"
                  readOnly
                />
              </div>
              <div className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
                <label
                  htmlFor="rating"
                  className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Rating
                </label>
                <select
                  id="rating"
                  name="rating"
                  value={rating}
                  onChange={formOnChange}
                  required
                  aria-required
                  className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-gray-100"
                >
                  <option disabled value="">
                    Select a rating
                  </option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
                <div className="text-primary-400 inline-flex focus-within:rounded-sm focus-within:ring-2 focus-within:ring-gray-400 focus-within:outline-none">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <label key={`star${num}`} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={num}
                        checked={rating === num}
                        onChange={formOnChange}
                        className="sr-only"
                      />
                      <Star size={20} fillNone={num > (rating || 0)} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-gray-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Comment
                </label>
                <input
                  aria-label="Comment"
                  type="text"
                  name="text"
                  id="text"
                  value={text}
                  className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-gray-100"
                  placeholder="Leave blank or leave a comment"
                  onChange={formOnChange}
                  maxLength={300}
                />
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
              className="bg-primary-400 hover:bg-primary-500 inline-flex w-full justify-center rounded-md px-3 py-2 text-base font-semibold text-white shadow-sm disabled:opacity-50 sm:ml-3 sm:w-auto"
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
              className="hocus:bg-gray-100 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset sm:mt-0 sm:w-auto"
              onClick={() => {
                dispatch(setModal({ status: 'closed' }))
              }}
            >
              Cancel
            </button>
          </div>
        </form>
        <div
          className={
            'border-primary-400 w-full rounded-xl border-2 bg-slate-100 dark:bg-slate-900 ' +
            'mt-8 ml-0 p-8 xl:mt-0 xl:ml-8' +
            'col-span-12 xl:col-span-5'
          }
        >
          <div className="w-full p-4">
            <ReviewSnippet
              text={text}
              name={
                (!firstName && !lastName
                  ? 'Anonymous'
                  : !lastName
                    ? firstName
                    : firstName + ' ' + lastName[0] + '.') || 'Anonymous'
              }
              rating={rating}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
