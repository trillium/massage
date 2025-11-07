import { z } from 'zod'

export const getCalendarEventsSchema = z.object({
  query: z.string().optional().describe('Search query to filter calendar events'),
  startDate: z.string().optional().describe('Start date in ISO format (YYYY-MM-DD)'),
  endDate: z.string().optional().describe('End date in ISO format (YYYY-MM-DD)'),
})

export const searchEmailsSchema = z.object({
  query: z
    .string()
    .optional()
    .describe(
      'Gmail search query (e.g., "from:example@gmail.com", "subject:invoice", "after:2024/01/01")'
    ),
  maxResults: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(10)
    .describe('Maximum number of emails to return (default: 10, max: 100)'),
  includeBody: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include email body content in results (default: false)'),
})
