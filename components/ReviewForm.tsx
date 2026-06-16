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
import { siteConfig } from '@/lib/siteConfig'
import forms from '@/data/forms.json'
import { TextSm, TextLg } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Stack } from '@/components/ui/stack'
import { Input } from '@/components/ui/input'
import { Box } from '@/components/ui/box'

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

  const reviewForms = forms.review

  return (
    <Box className="mx-auto w-full max-w-7xl px-4 md:px-0">
      <Box className="mb-11 grid grid-cols-12">
        <form
          className={'mt-3 w-full sm:mt-0' + ' ' + 'col-span-12 xl:col-span-7'}
          onSubmit={(event) => {
            handleReviewSubmit(event, dispatch, router)
          }}
        >
          <Box className="border-l-primary-400 bg-primary-100/30 dark:bg-primary-50/10 mt-3 mb-4 rounded-md border-l-4 p-3">
            <TextLg className="text-primary-800 dark:text-primary-400 text-base font-semibold md:text-lg">
              {formatLocalDate(start, { timeZone })}
            </TextLg>
            <TextSm className="md:text-base">
              {formatLocalTime(start, { timeZone })}
              {reviewForms.timeSeparator}
              {formatLocalTime(end, { timeZone })}
            </TextSm>
          </Box>

          <Input type="hidden" readOnly name="source" value={siteConfig.business.name} />
          <Input type="hidden" readOnly name="type" value="table" />
          <Input type="hidden" readOnly name="date" value={start} />
          <Input type="hidden" readOnly name="error" value={error} />

          <Stack className="space-y-4" direction="col">
            <Box className="isolate -space-y-px rounded-md shadow-sm">
              <Stack
                className="row focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-accent-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2"
                direction="row"
              >
                <Box className="mx-1 w-full">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-accent-900 dark:text-accent-100"
                  >
                    {reviewForms.fields.firstName.label}
                  </label>
                  <Input
                    aria-label="Name"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    required
                    aria-required
                    name="firstName"
                    id="firstName"
                    value={firstName}
                    placeholder={reviewForms.fields.firstName.placeholder}
                    onChange={formOnChange}
                    className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-accent-900 placeholder:text-accent-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-accent-100"
                  />
                </Box>
                <Box className="mx-1 w-full">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-accent-900 dark:text-accent-100"
                  >
                    {reviewForms.fields.lastName.label}
                  </label>
                  <Input
                    aria-label="Name"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    required
                    aria-required
                    name="lastName"
                    id="lastName"
                    value={lastName}
                    placeholder={reviewForms.fields.lastName.placeholder}
                    onChange={formOnChange}
                    className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-accent-900 placeholder:text-accent-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-accent-100"
                  />
                </Box>
              </Stack>
              <Box className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-accent-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-accent-900 dark:text-accent-100"
                >
                  {reviewForms.fields.date.label}
                </label>
                <Input
                  aria-label="Phone Number"
                  required
                  autoComplete="tel"
                  aria-required
                  name="date"
                  id="date"
                  value={formatLocalDate(start, { timeZone })}
                  className="mb-1 block w-full border-0 bg-surface-400 p-0 py-1 pl-2 text-accent-900 select-none placeholder:text-accent-400 focus:ring-0 sm:text-base sm:leading-6 dark:bg-surface-700 dark:text-accent-100"
                  readOnly
                />
              </Box>
              <Box className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-accent-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
                <label
                  htmlFor="rating"
                  className="mt-2 block text-sm font-medium text-accent-900 dark:text-accent-100"
                >
                  {reviewForms.fields.rating.label}
                </label>
                <Select
                  id="rating"
                  name="rating"
                  value={rating}
                  onChange={formOnChange}
                  required
                  aria-required
                  className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-accent-900 placeholder:text-accent-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-accent-100"
                >
                  <option disabled value="">
                    {reviewForms.fields.rating.selectDefault}
                  </option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </Select>
                <Box className="text-primary-400 inline-flex focus-within:rounded-sm focus-within:ring-2 focus-within:ring-accent-400 focus-within:outline-none">
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
                </Box>
              </Box>
              <Box className="focus-within:ring-primary-400 relative px-3 pt-2.5 pb-1.5 ring-1 ring-accent-300 ring-inset first:rounded-md first:rounded-b-none last:rounded-md last:rounded-t-none focus-within:z-10 focus-within:ring-2">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-accent-900 dark:text-accent-100"
                >
                  {reviewForms.fields.comment.label}
                </label>
                <Input
                  aria-label="Comment"
                  type="text"
                  name="text"
                  id="text"
                  value={text}
                  className="mb-1 block w-full border-0 p-0 py-1 pl-2 text-accent-900 placeholder:text-accent-400 focus:ring-0 sm:text-base sm:leading-6 dark:text-accent-100"
                  placeholder={reviewForms.fields.comment.placeholder}
                  onChange={formOnChange}
                  maxLength={300}
                />
              </Box>
            </Box>
          </Stack>
          {modal === 'error' && (
            <Box className="bg-red-50 text-red-600">{reviewForms.messages.error}</Box>
          )}
          <Box className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button
              type="submit"
              disabled={modal === 'busy'}
              className="bg-primary-400 hover:bg-primary-500 inline-flex w-full justify-center rounded-md px-3 py-2 text-base font-semibold text-white shadow-sm disabled:opacity-50 sm:ml-3 sm:w-auto"
            >
              {modal === 'busy' ? (
                <>
                  {reviewForms.buttons.submitting} <Spinner className="ml-2" />
                </>
              ) : (
                reviewForms.buttons.submit
              )}
            </Button>
            <Button
              type="button"
              className="hocus:bg-surface-200 mt-3 inline-flex w-full justify-center rounded-md bg-surface-50 px-3 py-2 text-base font-semibold text-accent-900 shadow-sm ring-1 ring-accent-300 ring-inset sm:mt-0 sm:w-auto"
              onClick={() => {
                dispatch(setModal({ status: 'closed' }))
              }}
            >
              {reviewForms.buttons.cancel}
            </Button>
          </Box>
        </form>
        <Box
          className={
            'border-primary-400 w-full rounded-xl border-2 bg-surface-200 dark:bg-surface-900 ' +
            'mt-8 ml-0 p-8 xl:mt-0 xl:ml-8' +
            'col-span-12 xl:col-span-5'
          }
        >
          <Box className="w-full p-4">
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
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
