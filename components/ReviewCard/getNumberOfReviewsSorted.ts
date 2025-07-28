import type { ReviewType, RatingCount } from '@/lib/types'

export function getNumberOfReviewsSorted(sliced_sorted: ReviewType[]): RatingCount {
  return sliced_sorted.reduce(
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
      averageStr: '',
      length: 0,
    }
  )
}
