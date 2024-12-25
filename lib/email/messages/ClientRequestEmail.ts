import { EmailProps } from "@/lib/types"

const LINE_PREFIX = `<div class="gmail_default" style="font-family:arial,sans-serif">`
const LINE_SUFFIX = `</div>`

export default function ClientRequestEmail({
  duration,
  price,
  firstName,
  dateSummary,
  location,
}: Omit<EmailProps, "approveUrl">) {
  const SUBJECT = `Massage Session Request $${price}, ${duration} minutes`

  let body = `<div dir="ltr">`
  body += [
    `Hi ${firstName || "there"}`,
    `<br>`,
    `Just letting you know I received your appointment request!`,
    `<br>`,
    `<b>Date:</b> ${dateSummary}`,
    `<b>Location:</b> ${location}`,
    `<b>Price:</b> $${price}`,
    `<b>Duration:</b> ${duration} minutes`,
    `<br>`,
    `I'll review it as soon as I can and get back to you with a confirmation.`,
    `<br>`,
    `Thanks!`,
    `<br>`,
    `Trillium Smith`,
  ]
    .map((line) => `${LINE_PREFIX}${line}${LINE_SUFFIX}`)
    .join("")

  body += `</div>`

  return { subject: SUBJECT, body }
}
