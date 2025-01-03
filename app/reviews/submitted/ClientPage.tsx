'use client'
import { useReduxFormData } from '@/redux/hooks'

import Template from 'components/Template'
import { ReviewSnippet } from 'components/ReviewCard'
import BookSessionButton from 'components/BookSessionButton'

export default function About() {
  const { firstName, lastName, text, rating } = useReduxFormData()

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <Template title="Thanks! Your review has been received!" />
      <div
        className={
          'w-full max-w-lg rounded-xl border-2 border-primary-400 bg-slate-100 dark:bg-slate-900 ' +
          'ml-0 mt-8 p-8 xl:ml-8 xl:mt-0 ' +
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
          <BookSessionButton title="Book a Session!" href="/" />
        </div>
      )}
    </div>
  )
}
