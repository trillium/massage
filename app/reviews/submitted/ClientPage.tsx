'use client'
import { useReduxReviewFormData } from '@/redux/hooks'

import Template from 'components/Template'
import { ReviewSnippet } from 'components/ReviewCard/ReviewSnippet'
import BookSessionButton from 'components/BookSessionButton'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export default function About() {
  const { firstName, lastName, text, rating } = useReduxReviewFormData()

  return (
    <Stack className="h-full" direction="col" align="center" justify="between">
      <Template title="Thanks! Your review has been received!" />
      <Box
        className={
          'border-primary-400 w-full max-w-lg rounded-xl border-2 bg-surface-200 dark:bg-surface-900 ' +
          'mt-8 ml-0 p-8 xl:mt-0 xl:ml-8' +
          ''
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
      {rating && rating > 3 && (
        <Box className="pt-8">
          <BookSessionButton title="Book a Session!" href="/book" />
        </Box>
      )}
    </Stack>
  )
}
