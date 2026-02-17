import Template from 'components/Template'
import clsx from 'clsx'
import type { ReviewType } from '@/lib/types'
import { getNumberOfReviews } from './getNumberOfReviews'
import TestimonialsSection from '../landingPage/TestimonialsSection'
import { fetchReviews } from '@/lib/reviews/fetchReviews'
import { filterTestimonialReviews } from '@/lib/reviews/filterTestimonialReviews'
import { Star, LittleStar } from './Stars'

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
          <div className="col-span-12 flex items-center xl:col-span-5">
            <div className="box mx-auto flex w-full flex-col gap-y-4 max-xl:max-w-3xl">
              {[5, 4, 3, 2, 1].map((num) => (
                <div key={'num' + num} className="text-primary-400 flex w-full items-center">
                  <p className="mr-2 py-1 text-lg font-medium text-black dark:text-white">{num}</p>
                  <LittleStar />
                  <p className="mr-3 ml-5 h-2 w-full rounded-3xl bg-gray-200 sm:min-w-72">
                    <span
                      style={{ width: `${ratingPercent[num]}%` }}
                      className={`bg-primary-500 flex h-full rounded-3xl`}
                    ></span>
                  </p>
                  <p className="mr-2 w-5 py-1 text-lg font-medium text-black dark:text-white">
                    {reviews[num]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 min-h-60 w-full max-xl:mt-8 xl:col-span-7 xl:pl-8">
            <div
              className={clsx(
                'flex h-full w-full items-center justify-center rounded-3xl max-xl:mx-auto max-xl:max-w-3xl max-lg:py-8',
                'border-primary-400 border-2 bg-gray-100 dark:bg-slate-900'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-full w-full flex-col items-center justify-center sm:flex-row">
                  <ScoreDisplay
                    test={true}
                    averageStr={numberOfReviews.averageStr}
                    text={`${numberOfReviews.length} Ratings`}
                  />

                  <ScoreDisplay
                    test={
                      numberOfReviewsSorted.average >= numberOfReviews.average ||
                      numberOfReviewsSorted.averageStr == numberOfReviews.averageStr
                    }
                    averageStr={numberOfReviewsSorted.averageStr}
                    text={`${slice_size} Most Recent`}
                  />
                </div>
              </div>
            </div>
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
    <div
      className={clsx(
        'flex flex-col items-center justify-center border-gray-200 pt-6 sm:pt-0',
        'last:border-t first:sm:pr-3 last:sm:border-t-0 last:sm:border-l last:sm:pl-3'
      )}
    >
      <h2 className="mb-4 text-center text-5xl font-bold text-black dark:text-gray-200">
        {averageStr}
      </h2>
      <div className="text-primary-400 mb-4 flex items-center gap-3">
        <Star />
        <Star />
        <Star />
        <Star />
        <Star percent={0.6 / 5} />
      </div>
      <p className="text-lg leading-8 font-normal text-gray-400">{text}</p>
    </div>
  )
}

export default ReviewCard
