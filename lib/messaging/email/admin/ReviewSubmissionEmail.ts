import type { EmailProps, RatingTypeStrict } from '@/lib/types'
import type { ReviewSnippetProps } from '@/components/ReviewCard'
import { parts as signatureParts } from './emailSegments/signature'
import localeDayString from '@/lib/locale'

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

type ReviewSubmissionEmailProps = {
  firstName: string
  lastName: string
  dateSummary?: string
  price?: number | string
  duration?: string
  rating: RatingTypeStrict
  date: string
  text: string
  source: string
  type: string
}
export default function ReviewSubmissionEmail({
  firstName,
  lastName,
  dateSummary,
  price,
  duration,
  rating,
  date,
  text,
  source,
  type,
}: ReviewSubmissionEmailProps) {
  const SUBJECT = `REVIEW SUBMISSION: ${firstName} ${lastName}, ${rating} Stars, ${date}`

  let body = `<div dir="ltr">`
  body += [
    `<b>{`,
    `<b>rating: ${rating},`,
    `<b>date: ${localeDayString(new Date(date))},`,
    `<b>comment: ${text},`,
    `<b>name: ${firstName} ${lastName[0]}.,`,
    `<b>source: ${source},`,
    `<b>type: ${type},`,
    `<b>}`,
    `<br>`,
    ...signatureParts,
  ]
    .map((line) => `${LINE_PREFIX}${line}${LINE_SUFFIX}`)
    .join('')

  body += `</div>`

  return { subject: SUBJECT, body }
}
