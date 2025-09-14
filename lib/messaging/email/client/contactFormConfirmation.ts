import { ContactFormType } from '../../../types'

/**
 * Creates a confirmation email body for users who submit the contact form.
 *
 * @function
 * @returns {string} Returns the confirmation email body string.
 */
function contactFormConfirmation({ name, message }: ContactFormType) {
  const output = `
    <h2>Thank you for contacting Trillium Massage</h2>
    <p>Hi ${name},</p>
    <p>We've received your message and will get back to you within 24 hours.</p>
    <p><strong>Your message:</strong></p>
    <p>${message}</p>
    <br>
    <p>Best regards,</p>
    <p>Trillium Smith, LMT<br>
    <a href="https://trilliummassage.la/">www.trilliummassage.la</a></p>
  `

  return output
}

export default contactFormConfirmation
