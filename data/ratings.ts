import type { ReviewType } from '@/lib/types'
import sootheRatings from './ratings-soothe'
import airbnbRatings from './ratings-airbnb'

export const links = {
  airbnb: 'https://www.airbnb.com/services/6527842?modal=reviews',
}

const ratings: ReviewType[] = [...sootheRatings, ...airbnbRatings]

export default ratings
