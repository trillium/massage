'use client'
import { useReduxReviewFormData } from '@/redux/hooks'

import Template from 'components/Template'
import { ReviewSnippet } from 'components/ReviewCard/ReviewSnippet'
import BookSessionButton from 'components/BookSessionButton'

export default function About() {
  const { firstName, lastName, text, rating } = useReduxReviewFormData()

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <Template title="Thanks! Your review has been received!" />
      <div
        className={
          'border-primary-400 w-full max-w-lg rounded-xl border-2 bg-surface-200 dark:bg-surface-900 ' +
          'mt-8 ml-0 p-8 xl:mt-0 xl:ml-8' +
          ''
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
      {rating && rating > 3 && (
        <div className="pt-8">
          <BookSessionButton title="Book a Session!" href="/book" />
        </div>
      )}
    </div>
  )
}
