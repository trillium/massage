import { EmailProps } from "@/lib/types"

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

export default function ApprovalEmail({
  email,
  firstName,
  lastName,
  location,
  dateSummary,
  approveUrl,
  timeZone,
  price,
  phone,
  duration
}: EmailProps) {
  const SUBJECT = `REQUEST: ${firstName} ${lastName}, ${duration} minutes, $${price}`

  const declineUrl = `mailto:${encodeURI(email)}?subject=${encodeURIComponent(
    `Re: Massage appointment request`
  )}&body=${encodeURIComponent(
    `Hi ${`${firstName}` || "there"},

I just checked my calendar and it looks like ${dateSummary} won't work.

Would you be able to meet at a different time?`
  )}`

  let body = `<div dir="ltr">`
  body += [
    `<b>${firstName} ${lastName}</b> has requested a meeting:`,
    `<br>`,
    `Their local timezone is ${timeZone}`,
    `<br>`,
    `<b>First Name:</b> ${firstName}`,
    `<b>Last Name:</b> ${lastName}`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Location:</b> ${location}`,
    `<b>Price:</b> $${price}`,
    `<b>Duration:</b> ${duration} minutes`,
    `<b>Phone Number:</b> ${phone}`,
    `<br>`,
    `<br>`,
    `<b><a href=${approveUrl}>Accept the appointment</a></b>`,
    `<br>`,
    `<b><a href=${declineUrl}>Decline the appointment</a></b>`,
    `<br>`,
  ]
    .map((line) => `${LINE_PREFIX}${line}${LINE_SUFFIX}`)
    .join("")

  body += `</div>`

  return { subject: SUBJECT, body }
}
