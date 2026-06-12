import { fetchReviewsAdmin } from '@/lib/reviews/fetchReviewsAdmin'
import { ReviewsClient } from './ReviewsClient'
import { H1 } from '@/components/ui/heading'

export default async function ReviewsPage() {
  const reviews = await fetchReviewsAdmin()

  return (
    <div className="py-4">
      <H1 className="mb-6">Reviews</H1>
      <ReviewsClient initialReviews={reviews} />
    </div>
  )
}
