import { EmailProps, ReviewType } from '@/lib/types'
import { parts as signatureParts } from '@/lib/messaging/utilities/signature'

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

type ReviewSubmissionProps = Omit<EmailProps, 'timeZone' | 'email' | 'location' | 'approveUrl'> &
  ReviewType

export default function ReviewSubmission({
  name,
  dateSummary,
  price,
  duration,
  rating,
  date,
  comment,
  source,
  type,
}: ReviewSubmissionProps) {
  const SUBJECT = `REVIEW SUBMISSION: ${name}, ${rating} Stars, ${date}`

  let body = `<div dir="ltr">`
  body += [
    `{`,
    `<b>rating:</b> ${rating},`,
    `<b>date:</b> ${date},`,
    `<b>comment:</b> ${comment},`,
    `<b>name:</b> ${name},`,
    `<b>source:</b> ${source},`,
    `<b>type:</b> ${type},`,
    `}`,
    `<br>`,
    `<b>Name:</b> ${name}`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Price:</b> $${price}`,
    `<b>Duration:</b> ${duration} minutes`,
    `<br>`,
    ...signatureParts,
  ]
    .map((line) => `${LINE_PREFIX}${line}${LINE_SUFFIX}`)
    .join('')

  body += `</div>`

  return { subject: SUBJECT, body }
}
