import { z } from 'zod'
import { ContactFormSchema } from '@/lib/schema'

/**
 * Creates a pushover message for contact form submissions.
 */
export function ContactPushover(data: z.output<typeof ContactFormSchema>) {
  const title = 'Contact Form Submission'

  const message = `New contact form from ${data.name} (${data.email}): ${data.subject}\n${data.message}`

  return { message, title }
}
