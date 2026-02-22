import { ContactFormType } from '@/lib/types'
import { siteConfig } from '@/lib/siteConfig'

function contactFormEmail({ subject, name, email, phone, message }: ContactFormType) {
  const domain = siteConfig.domain.siteUrl.replace(/\/$/, '')
  const domainDisplay = domain.replace(/^https?:\/\//, '')

  let output = 'New Contact Form Submission'
  output += '<br><br>'
  output += `<b>Subject</b>: ${subject}<br>`
  output += `<b>Name</b>: ${name}<br>`
  output += `<b>Email</b>: ${email}<br>`
  output += `<b>Phone</b>: ${phone}<br>`
  output += '<br>'
  output += `<b>Message</b>:<br>${message}<br>`
  output += '<br><br>'
  output += `Submitted on: ${new Date().toLocaleString()}`
  output += '<br><br>'
  output += `${siteConfig.business.ownerName}, LMT`
  output += '<br>'
  output += `<a href="${domain}/">www.${domainDisplay}</a><br>`

  return output
}

export default contactFormEmail
