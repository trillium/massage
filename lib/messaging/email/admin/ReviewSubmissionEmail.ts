import type { EmailProps, RatingTypeStrict, ReviewSnippetProps } from '@/lib/types'
import { parts as signatureParts } from '@/lib/messaging/utilities/signature'
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
    `{`,
    `<b>rating:</b> ${rating},`,
    `<b>date:</b> ${localeDayString(new Date(date))},`,
    `<b>comment:</b> ${text},`,
    `<b>name:</b> ${firstName} ${lastName[0]}.,`,
    `<b>source:</b> ${source},`,
    `<b>type:</b> ${type},`,
    `}`,
    `<br>`,
    ...signatureParts,
  ]
    .map((line) => `${LINE_PREFIX}${line}${LINE_SUFFIX}`)
    .join('')

  body += `</div>`

  return { subject: SUBJECT, body }
}
