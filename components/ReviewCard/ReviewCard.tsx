import Template from 'components/Template'
import clsx from 'clsx'
import type { ReviewType } from '@/lib/types'
import { getNumberOfReviews } from './getNumberOfReviews'
import TestimonialsSection from '../landingPage/TestimonialsSection'
import { fetchReviews } from '@/lib/reviews/fetchReviews'
import { filterTestimonialReviews } from '@/lib/reviews/filterTestimonialReviews'
import { Star, LittleStar } from './Stars'
import { H2 } from '@/components/ui/heading'
import { TextLgMuted, TextLg, TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

const slice_size = 50

const ReviewCard = async () => {
  const allReviews = await fetchReviews()

  const sorted_reviews = allReviews.sort((a: ReviewType, b: ReviewType) =>
    b.date.localeCompare(a.date)
  )
  const sliced_sorted = sorted_reviews.slice(0, slice_size)

  const numberOfReviews = getNumberOfReviews(sorted_reviews)
  const numberOfReviewsSorted = getNumberOfReviews(sliced_sorted)

  const reviews: { [key: number]: number } = numberOfReviews

  const ratingPercent: { [key: number]: string } = {
    1: ((numberOfReviews[1] / allReviews.length) * 100).toFixed(0),
    2: ((numberOfReviews[2] / allReviews.length) * 100).toFixed(0),
    3: ((numberOfReviews[3] / allReviews.length) * 100).toFixed(0),
    4: ((numberOfReviews[4] / allReviews.length) * 100).toFixed(0),
    5: ((numberOfReviews[5] / allReviews.length) * 100).toFixed(0),
  }

  const testimonialReviews = filterTestimonialReviews(allReviews)

  return (
    <div className="w-full pb-6">
      <OtherCard
        reviews={reviews}
        ratingPercent={ratingPercent}
        numberOfReviews={numberOfReviews}
        numberOfReviewsSorted={numberOfReviewsSorted}
        testimonialReviews={testimonialReviews}
      />
    </div>
  )
}

type RatingCount = {
  1: number
  2: number
  3: number
  4: number
  5: number
  sum: number
  average: number
  averageStr: string
  length: number
}

const OtherCard = ({
  reviews,
  ratingPercent,
  numberOfReviews,
  numberOfReviewsSorted,
  testimonialReviews,
}: {
  reviews: { [key: number]: number }
  ratingPercent: { [key: number]: string }
  numberOfReviews: RatingCount
  numberOfReviewsSorted: RatingCount
  testimonialReviews: ReviewType[]
}) => (
  <>
    <div className="mx-auto w-full max-w-7xl px-0 md:px-4">
      <div>
        <Template title="Customer Reviews & Ratings" />

        <div className="mb-11 grid grid-cols-12">
          <Stack className="col-span-12 xl:col-span-5" direction="row" align="center">
            <Stack className="box mx-auto w-full gap-y-4 max-xl:max-w-3xl" direction="col">
              {[5, 4, 3, 2, 1].map((num) => (
                <Stack
                  key={'num' + num}
                  className="text-primary-400 w-full"
                  direction="row"
                  align="center"
                >
                  <TextLg className="mr-2 py-1 text-lg font-medium text-accent-950 dark:text-white">
                    {num}
                  </TextLg>
                  <LittleStar />
                  <TextBase className="mr-3 ml-5 h-2 w-full rounded-3xl bg-surface-200 sm:min-w-72">
                    <span
                      style={{ width: `${ratingPercent[num]}%` }}
                      className={`bg-primary-500 flex h-full rounded-3xl`}
                    ></span>
                  </TextBase>
                  <TextLg className="mr-2 w-5 py-1 text-lg font-medium text-accent-950 dark:text-white">
                    {reviews[num]}
                  </TextLg>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <div className="col-span-12 min-h-60 w-full max-xl:mt-8 xl:col-span-7 xl:pl-8">
            <Stack
              direction="row"
              align="center"
              justify="center"
              className="h-full w-full rounded-3xl max-xl:mx-auto max-xl:max-w-3xl max-lg:py-8 border-primary-400 border-2 bg-surface-200 dark:bg-surface-900"
            >
              <Stack className="w-full" direction="row" align="center" justify="between">
                <Stack direction="col" align="center" justify="center" className="h-full w-full sm:flex-row">
                  <ScoreDisplay
                    test={true}
                    averageStr={numberOfReviews.averageStr}
                    text={`${numberOfReviews.length} Ratings`}
                  />

                  <ScoreDisplay
                    test={
                      numberOfReviewsSorted.average >= numberOfReviews.average ||
                      numberOfReviewsSorted.averageStr === numberOfReviews.averageStr
                    }
                    averageStr={numberOfReviewsSorted.averageStr}
                    text={`${slice_size} Most Recent`}
                  />
                </Stack>
              </Stack>
            </Stack>
          </div>
        </div>

        <TestimonialsSection reviews={testimonialReviews} />
      </div>
    </div>
  </>
)

const ScoreDisplay = ({
  test,
  averageStr,
  text,
}: {
  test: boolean
  averageStr: string
  text: string
}) => {
  if (test === false) return <></>

  return (
    <Stack
      direction="col"
      align="center"
      justify="center"
      className="border-accent-200 pt-6 sm:pt-0 last:border-t first:sm:pr-3 last:sm:border-t-0 last:sm:border-l last:sm:pl-3"
    >
      <H2 className="mb-4 text-center">{averageStr}</H2>
      <Stack className="text-primary-400 mb-4" direction="row" align="center" gap={3}>
        <Star />
        <Star />
        <Star />
        <Star />
        <Star percent={0.6 / 5} />
      </Stack>
      <TextLgMuted>{text}</TextLgMuted>
    </Stack>
  )
}

export default ReviewCard
