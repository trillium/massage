import Template from "@/components/Template"
import review_data from "@/data/ratings.json"
import clsx from "clsx"
import { RatingType } from "./ReviewForm"

const sorted_reviews = (review_data as ReviewType[]).sort(
  (a: ReviewType, b: ReviewType) => b.date.localeCompare(a.date)
)

const slice_size = 50
const sliced_sorted = sorted_reviews.slice(0, slice_size)

export type ReviewType = {
  rating: 1 | 2 | 3 | 4 | 5
  date: string
  comment: string | null
  name: string
  source: string
  type?: string
  helpful?: number
}

// Define a type for the accumulator object
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

const numberOfReviews = sorted_reviews.reduce(
  (acc: RatingCount, curr: ReviewType, index: number): RatingCount => {
    acc[curr.rating] += 1
    acc.sum += curr.rating
    acc.average = acc.sum / (index + 1)
    acc.averageStr = (acc.sum / (index + 1)).toFixed(1)
    acc.length = index + 1
    return acc
  },
  {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    sum: 0,
    average: 0,
    averageStr: "",
    length: 0,
  }
)

const numberOfReviewsSorted = sliced_sorted.reduce(
  (acc: RatingCount, curr: ReviewType, index: number): RatingCount => {
    acc[curr.rating] += 1
    acc.sum += curr.rating
    acc.average = acc.sum / (index + 1)
    acc.averageStr = (acc.sum / (index + 1)).toFixed(1)
    acc.length = index + 1
    return acc
  },
  {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    sum: 0,
    average: 0,
    averageStr: "",
    length: 0,
  }
)

const reviews: { [key: number]: number } = numberOfReviews

const ratingPercent: { [key: number]: string } = {
  1: ((numberOfReviews[1] / review_data.length) * 100).toFixed(0),
  2: ((numberOfReviews[2] / review_data.length) * 100).toFixed(0),
  3: ((numberOfReviews[3] / review_data.length) * 100).toFixed(0),
  4: ((numberOfReviews[4] / review_data.length) * 100).toFixed(0),
  5: ((numberOfReviews[5] / review_data.length) * 100).toFixed(0),
}

const ReviewCard = () => {
  return (
    <div className="w-full pb-6">
      <OtherCard />
    </div>
  )
}

const OtherCard = ({ enableSorting = false }) => (
  <>
    <div className="w-full max-w-7xl px-4 md:px-0 mx-auto">
      <div>
        <Template title="Customer Reviews & Ratings" />

        <div className="grid grid-cols-12 mb-11">
          <div className="col-span-12 xl:col-span-5 flex items-center">
            <div className="box flex flex-col gap-y-4 w-full max-xl:max-w-3xl mx-auto">
              {[5, 4, 3, 2, 1].map((num) => (
                <div
                  key={"num" + num}
                  className="flex items-center w-full text-primary-400">
                  <p className="font-medium text-lg py-1 text-black dark:text-white mr-2">
                    {num}
                  </p>
                  <LittleStar />
                  <p className="h-2 w-full sm:min-w-72 rounded-3xl bg-gray-200 ml-5 mr-3">
                    <span
                      style={{ width: `${ratingPercent[num]}%` }}
                      className={`h-full rounded-3xl bg-secondary-500 flex`}></span>
                  </p>
                  <p className="font-medium w-5 text-lg py-1 text-black dark:text-white mr-2">
                    {reviews[num]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 max-xl:mt-8 xl:col-span-7 xl:pl-8 w-full min-h-60">
            <div
              className={clsx(
                "flex items-center justify-center h-full max-lg:py-8 rounded-3xl w-full max-xl:max-w-3xl max-xl:mx-auto",
                "bg-gray-100 dark:bg-slate-900 border-2 border-primary-400"
              )}>
              <div className="w-full flex justify-between items-center">
                <div className="flex flex-col sm:flex-row items-center justify-center w-full h-full">
                  <ScoreDisplay
                    test={true}
                    averageStr={numberOfReviews.averageStr}
                    text={`${numberOfReviews.length} Ratings`}
                  />

                  <ScoreDisplay
                    test={
                      numberOfReviewsSorted.average >=
                        numberOfReviews.average ||
                      numberOfReviewsSorted.averageStr ==
                        numberOfReviews.averageStr
                    }
                    averageStr={numberOfReviewsSorted.averageStr}
                    text={`${slice_size} Most Recent`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <MostHelpful />

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8  max-xl:max-w-3xl max-xl:mx-auto">
          <p className="font-normal text-lg py-1 text-black dark:text-white">
            {review_data.length} reviews
          </p>
          {enableSorting && <ReviewSorting />}
        </div>
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
        "pt-6 sm:pt-0 flex items-center justify-center flex-col  border-gray-200",
        "last:sm:pl-3 first:sm:pr-3 last:sm:border-l last:sm:border-t-0 last:border-t"
      )}>
      <h2 className="font-bold text-5xl text-black dark:text-gray-200 text-center mb-4">
        {averageStr}
      </h2>
      <div className="flex items-center gap-3 mb-4 text-primary-400">
        <Star />
        <Star />
        <Star />
        <Star />
        <Star percent={0.6 / 5} />
      </div>
      <p className="font-normal text-lg leading-8 text-gray-400">{text}</p>
    </div>
  )
}

const MostHelpful = () => (
  <div className="pb-8 border-b border-gray-200 max-xl:max-w-3xl max-xl:mx-auto">
    <h4 className="font-semibold text-3xl leading-10 text-black dark:text-white mb-6">
      Most helpful reviews
    </h4>
    {(review_data as ReviewType[])
      .filter((item) => item.helpful)
      .sort((a, b) => (b.helpful ?? 0) - (a.helpful ?? 0))
      .map(({ comment, date, name }) => (
        <ReviewSnippet
          key={`${date}_${name}`}
          text={comment ?? ""}
          name={name}
        />
      ))}
  </div>
)

export type ReviewSnippetProps = {
  name?: string
  firstName?: string
  lastName?: string
  text?: string
  date?: string
  displayDate?: Boolean
  rating?: RatingType
}

export const ReviewSnippet = ({
  text,
  firstName,
  lastName,
  name,
  date,
  displayDate = false,
  rating = 5,
}: ReviewSnippetProps) => {
  const displayName =
    name ||
    (!firstName && !lastName
      ? "Anonymous"
      : !lastName
      ? firstName
      : firstName + " " + lastName[0] + ".") ||
    "Anonymous"

  return (
    <div className="pt-4">
      <div className="flex sm:items-center flex-col sm:flex-row justify-between  mb-4">
        <div className="flex items-center gap-3 text-primary-400">
          {Array.from({ length: rating || 0 }, (_, i) => (
            <Star key={i} size={30} />
          ))}
          {Array.from({ length: 5 - (rating || 0) }, (_, i) => (
            <Star key={i} fillNone size={30} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <h6 className="font-semibold text-lg leading-8 text-black dark:text-white capitalize">
            {displayName}
          </h6>
          {displayDate && (
            <p className="font-medium text-base leading-7 text-gray-400">
              {date}
            </p>
          )}
        </div>
      </div>

      <p className="font-normal text-lg leading-8 text-gray-800 dark:text-gray-400 ">
        {text}
      </p>
    </div>
  )
}

const LittleStar = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_12042_8589)">
      <path d="M9.10326 2.31699C9.47008 1.57374 10.5299 1.57374 10.8967 2.31699L12.7063 5.98347C12.8519 6.27862 13.1335 6.48319 13.4592 6.53051L17.5054 7.11846C18.3256 7.23765 18.6531 8.24562 18.0596 8.82416L15.1318 11.6781C14.8961 11.9079 14.7885 12.2389 14.8442 12.5632L15.5353 16.5931C15.6754 17.41 14.818 18.033 14.0844 17.6473L10.4653 15.7446C10.174 15.5915 9.82598 15.5915 9.53466 15.7446L5.91562 17.6473C5.18199 18.033 4.32456 17.41 4.46467 16.5931L5.15585 12.5632C5.21148 12.2389 5.10393 11.9079 4.86825 11.6781L1.94038 8.82416C1.34687 8.24562 1.67438 7.23765 2.4946 7.11846L6.54081 6.53051C6.86652 6.48319 7.14808 6.27862 7.29374 5.98347L9.10326 2.31699Z" />
    </g>
    <defs>
      <clipPath id="clip0_12042_8589">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const Star = ({
  size = 36,
  percent = 0,
  fillClasses = "",
  fillNone = false,
}: {
  size?: number
  percent?: number
  fillClasses?: string
  fillNone?: boolean
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className="stroke-current"
      fill={fillNone ? "" : "currentColor"}>
      <path d="M17.1033 2.71738C17.4701 1.97413 18.5299 1.97413 18.8967 2.71738L23.0574 11.1478C23.2031 11.4429 23.4846 11.6475 23.8103 11.6948L33.1139 13.0467C33.9341 13.1659 34.2616 14.1739 33.6681 14.7524L26.936 21.3146C26.7003 21.5443 26.5927 21.8753 26.6484 22.1997L28.2376 31.4656C28.3777 32.2825 27.5203 32.9055 26.7867 32.5198L18.4653 28.145C18.174 27.9919 17.826 27.9919 17.5347 28.145L9.21334 32.5198C8.47971 32.9055 7.62228 32.2825 7.76239 31.4656L9.35162 22.1997C9.40726 21.8753 9.29971 21.5443 9.06402 21.3146L2.33193 14.7524C1.73841 14.1739 2.06593 13.1659 2.88615 13.0467L12.1897 11.6948C12.5154 11.6475 12.7969 11.4429 12.9426 11.1478L17.1033 2.71738Z" />

      <g clipPath="url(#clipPath)">
        <path
          className={fillClasses || "fill-white"}
          d="M17.1033 2.71738C17.4701 1.97413 18.5299 1.97413 18.8967 2.71738L23.0574 11.1478C23.2031 11.4429 23.4846 11.6475 23.8103 11.6948L33.1139 13.0467C33.9341 13.1659 34.2616 14.1739 33.6681 14.7524L26.936 21.3146C26.7003 21.5443 26.5927 21.8753 26.6484 22.1997L28.2376 31.4656C28.3777 32.2825 27.5203 32.9055 26.7867 32.5198L18.4653 28.145C18.174 27.9919 17.826 27.9919 17.5347 28.145L9.21334 32.5198C8.47971 32.9055 7.62228 32.2825 7.76239 31.4656L9.35162 22.1997C9.40726 21.8753 9.29971 21.5443 9.06402 21.3146L2.33193 14.7524C1.73841 14.1739 2.06593 13.1659 2.88615 13.0467L12.1897 11.6948C12.5154 11.6475 12.7969 11.4429 12.9426 11.1478L17.1033 2.71738Z"
          clipPath={`polygon(${(1 - percent) * 100}% 0, 100% 0, 100% 100%, ${
            (1 - percent) * 100
          }% 100%)`}
        />
      </g>
    </svg>
  )
}

const ReviewSorting = () => (
  <form>
    <div className="flex">
      <div className="relative ">
        <div className=" absolute -left-0 px-2 top-0 py-2">
          <p className="font-normal text-lg leading-8 text-gray-500">
            Sort by:
          </p>
        </div>
        <input
          type="text"
          className="block w-60 h-11 pr-4 pl-20 py-2.5 text-lg leading-8 font-medium rounded-full cursor-pointer shadow-xs text-black dark:text-white bg-transparent placeholder-black focus:outline-gray-200 "
          placeholder="Most Relevant"
        />
        <div
          id="dropdown-button"
          data-target="dropdown"
          className="dropdown-toggle flex-shrink-0 cursor-pointer z-10 inline-flex items-center py-2.5 px-4 text-base font-medium text-center text-gray-900 bg-transparent absolute right-0 top-2 pl-2 ">
          <svg
            className="ml-2"
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 1.5L4.58578 5.08578C5.25245 5.75245 5.58579 6.08579 6 6.08579C6.41421 6.08579 6.74755 5.75245 7.41421 5.08579L11 1.5"
              stroke="#6B7280"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div
          id="dropdown"
          className="absolute top-9 right-0 z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdown-button">
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                Most Relevant
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                last week
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                oldest
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </form>
)

export default ReviewCard
