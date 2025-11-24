#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

import { getCalendarEvents } from './src/lib/mcp/tools/calendar-tools.js'
import { searchEmails } from './src/lib/mcp/tools/email-tools.js'
import { createCalendarEvent } from './src/lib/mcp/tools/create-calendar-event.js'
import {
  getCalendarEventsSchema,
  searchEmailsSchema,
  createCalendarEventSchema,
} from './src/lib/mcp/schemas.js'

const server = new Server(
  {
    name: 'massage-tracker',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_calendar_events',
        description:
          'Search and retrieve Google Calendar events, optionally filtered by query and date range.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to filter calendar events',
            },
            startDate: {
              type: 'string',
              description: 'Start date in ISO format (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date in ISO format (YYYY-MM-DD)',
            },
          },
        },
      },
      {
        name: 'create_calendar_event',
        description:
          'Create a new Google Calendar event on a specified calendar (or primary calendar by default).',
        inputSchema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Event title/summary',
            },
            startDateTime: {
              type: 'string',
              description: 'Start date and time in ISO 8601 format',
            },
            endDateTime: {
              type: 'string',
              description: 'End date and time in ISO 8601 format',
            },
            description: {
              type: 'string',
              description: 'Event description',
            },
            location: {
              type: 'string',
              description: 'Event location',
            },
            attendeeEmail: {
              type: 'string',
              description: 'Email of attendee to invite',
            },
            attendeeName: {
              type: 'string',
              description: 'Display name of attendee',
            },
            calendarId: {
              type: 'string',
              description:
                'Calendar ID (email address like trillium@trilliumsmith.com or trillium@hatsfabulous.com). Defaults to "primary"',
              default: 'primary',
            },
          },
          required: ['summary', 'startDateTime', 'endDateTime'],
        },
      },
      {
        name: 'search_emails',
        description:
          'Search Gmail messages using Gmail search syntax. Supports filters like from:, subject:, after:, before:, has:attachment, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description:
                'Gmail search query (e.g., "from:example@gmail.com", "subject:invoice", "after:2024/01/01")',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of emails to return (default: 10, max: 100)',
              default: 10,
            },
            includeBody: {
              type: 'boolean',
              description: 'Include email body content in results (default: false)',
              default: false,
            },
          },
        },
      },
    ],
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params

    switch (name) {
      case 'get_calendar_events':
        return await getCalendarEvents(getCalendarEventsSchema.parse(args))

      case 'create_calendar_event':
        return await createCalendarEvent(createCalendarEventSchema.parse(args))

      case 'search_emails':
        return await searchEmails(searchEmailsSchema.parse(args))

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.error('Massage Tracker MCP server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
