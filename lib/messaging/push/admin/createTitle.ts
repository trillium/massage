import { AppointmentRequestSchema } from '../../../schema'
import { z } from 'zod'
import { formatRelative } from 'date-fns'

// Create a title string from AppointmentRequest data object
export function createTitle(data: z.output<typeof AppointmentRequestSchema>): string {
  const { firstName, duration, start, price } = data
  const humanTime = formatRelative(new Date(start), new Date())
  return `[REQUEST] ${firstName} requests ${duration}m appt ${humanTime}, ${price}`
}
