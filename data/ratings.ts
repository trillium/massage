import type { ReviewType } from '@/lib/types'
import sootheRatings from './ratings-soothe'
import trilliumRatings from './ratings-trillium'
import airbnbRatings from './ratings-airbnb'

export const links = {
  airbnb: 'https://www.airbnb.com/services/6527842?modal=reviews',
}

const ratings: ReviewType[] = [...sootheRatings, ...trilliumRatings, ...airbnbRatings]

export default ratings
