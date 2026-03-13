import { fetchReviewsAdmin } from '@/lib/reviews/fetchReviewsAdmin'
import { ReviewsClient } from './ReviewsClient'

export default async function ReviewsPage() {
  const reviews = await fetchReviewsAdmin()

  return (
    <div className="py-4">
      <h1 className="mb-6 text-3xl font-bold text-accent-900 dark:text-accent-100">Reviews</h1>
      <ReviewsClient initialReviews={reviews} />
    </div>
  )
}
