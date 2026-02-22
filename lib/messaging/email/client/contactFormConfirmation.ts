import { ContactFormType } from '@/lib/types'
import { siteConfig } from '@/lib/siteConfig'

function contactFormConfirmation({ name, message }: ContactFormType) {
  const domain = siteConfig.domain.siteUrl.replace(/\/$/, '')
  const domainDisplay = domain.replace(/^https?:\/\//, '')

  const output = `
    <h2>Thank you for contacting ${siteConfig.business.name}</h2>
    <p>Hi ${name},</p>
    <p>We've received your message and will get back to you within 24 hours.</p>
    <p><strong>Your message:</strong></p>
    <p>${message}</p>
    <br>
    <p>Best regards,</p>
    <p>${siteConfig.business.ownerName}, LMT<br>
    <a href="${domain}/">www.${domainDisplay}</a></p>
  `

  return output
}

export default contactFormConfirmation
