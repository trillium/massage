import { ContactFormType } from '@/lib/types'
import { escapeHtml } from '@/lib/messaging/escapeHtml'

/**
 * Creates an email body for contact form submissions.
 *
 * @function
 * @returns {string} Returns the email body string for a contact form submission.
 */
function contactFormEmail({ subject, name, email, phone, message }: ContactFormType) {
  let output = 'New Contact Form Submission'
  output += '<br><br>'
  output += `<b>Subject</b>: ${escapeHtml(subject)}<br>`
  output += `<b>Name</b>: ${escapeHtml(name)}<br>`
  output += `<b>Email</b>: ${escapeHtml(email)}<br>`
  output += `<b>Phone</b>: ${escapeHtml(phone)}<br>`
  output += '<br>'
  output += `<b>Message</b>:<br>${escapeHtml(message)}<br>`
  output += '<br><br>'
  output += `Submitted on: ${new Date().toLocaleString()}`
  output += '<br><br>'
  output += 'Trillium Smith, LMT'
  output += '<br>'
  output += `<a href="https://trilliummassage.la/">www.trilliummassage.la</a><br>`

  return output
}

export default contactFormEmail
