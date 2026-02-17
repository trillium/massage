import type { ReviewType } from '@/lib/types'

export function filterTestimonialReviews(reviews: ReviewType[]): ReviewType[] {
  return reviews
    .filter((r) => r.rating === 5)
    .filter((r) => r.helpful !== -1)
    .filter((r) => (r.comment?.length ?? 0) > 0)
    .sort((a, b) => {
      const helpfulDiff = (b.helpful ?? 0) - (a.helpful ?? 0)
      if (helpfulDiff !== 0) return helpfulDiff
      const aStr = a.spellcheck || a.comment || ''
      const bStr = b.spellcheck || b.comment || ''
      return bStr.length - aStr.length
    })
    .slice(0, 18)
}
