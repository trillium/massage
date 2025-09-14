export type ReviewType = {
  rating: 1 | 2 | 3 | 4 | 5
  date: string
  comment?: string
  name: string
  source: string
  type?: string
  helpful?: number
  spellcheck?: string
}

export type RatingType = 1 | 2 | 3 | 4 | 5 | undefined | ''
export type RatingTypeStrict = 1 | 2 | 3 | 4 | 5

export type RatingCount = {
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
