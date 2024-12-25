import { EmailProps, ReviewType } from "@/lib/types"

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

type ReviewSubmissionProps = Omit<
  EmailProps,
  "timeZone" | "email" | "location" | "approveUrl"
> &
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
    `<b>{`,
    `<b>    rating: ${rating},`,
    `<b>    date: ${date},`,
    `<b>    comment: ${comment},`,
    `<b>    name: ${name},`,
    `<b>    source: ${source},`,
    `<b>    type: ${type},`,
    `<b>}`,
    `<br>`,
    `<b>Name:</b> ${name}`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Location:</b> ${location}`,
    `<b>Price:</b> $${price}`,
    `<b>Duration:</b> ${duration} minutes`,
    `<br>`,
  ]
    .map((line) => `${LINE_PREFIX}${line}${LINE_SUFFIX}`)
    .join("")

  body += `</div>`

  return { subject: SUBJECT, body }
}
