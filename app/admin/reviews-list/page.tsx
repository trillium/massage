import React from 'react'
import ratings from '@/data/ratings'
import fs from 'fs'

type Review = {
  rating: number
  date: string
  comment: string | null
  name: string
  source: string
}

const typedRatings: Review[] = ratings.map((rating) => ({
  rating: rating.rating,
  date: rating.date,
  comment: rating.comment || null,
  name: rating.name,
  source: rating.source,
}))

export default function ReviewsPage() {
  // Sort reviews by most recent date
  const sortedReviews = typedRatings.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Customer Reviews
        </h1>
        <div className="space-y-6">
          {sortedReviews.map((review, index) => (
            <div key={index} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {review.name} ({review.source})
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{review.date}</p>
              <p className="mt-4 text-gray-700 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
