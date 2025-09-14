import { ContactFormType } from '@/lib/types'

/**
 * Creates an email body for contact form submissions.
 *
 * @function
 * @returns {string} Returns the email body string for a contact form submission.
 */
function contactFormEmail({ subject, name, email, phone, message }: ContactFormType) {
  let output = 'New Contact Form Submission'
  output += '\n\n'
  output += `<b>Subject</b>: ${subject}\n`
  output += `<b>Name</b>: ${name}\n`
  output += `<b>Email</b>: ${email}\n`
  output += `<b>Phone</b>: ${phone}\n`
  output += '\n'
  output += `<b>Message</b>:\n${message}\n`
  output += '\n\n'
  output += `Submitted on: ${new Date().toLocaleString()}`
  output += '\n\n'
  output += 'Trillium Smith, LMT'
  output += '\n'
  output += `<a href="https://trilliummassage.la/">www.trilliummassage.la</a>\n`

  return output
}

export default contactFormEmail
