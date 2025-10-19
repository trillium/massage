import { z } from 'zod'
import { ContactFormSchema } from '@/lib/schema'

/**
 * Creates a pushover message for contact form submissions.
 */
export function ContactPushover(data: z.output<typeof ContactFormSchema>) {
  const title = `Contact: ${data.subject}`

  const message = `${data.name} (${data.email})
Phone: ${data.phone}

${data.message}`

  return { message, title }
}
