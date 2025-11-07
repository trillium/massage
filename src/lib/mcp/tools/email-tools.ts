import type { z } from 'zod'
import type { searchEmailsSchema } from '../schemas'
import type { GmailMessage } from '@/lib/emailTypes'
import getGmailAccessToken from '@/lib/gmail/getGmailAccessToken'

interface EmailMessage {
  id: string
  threadId: string
  subject?: string
  from?: string
  to?: string
  date?: string
  snippet?: string
  body?: string
}

export async function searchEmails(args: z.infer<typeof searchEmailsSchema>) {
  const { query = '', maxResults = 10, includeBody = false } = args

  try {
    const accessToken = await getGmailAccessToken()

    const searchUrl = new URL('https://www.googleapis.com/gmail/v1/users/me/messages')
    if (query) {
      searchUrl.searchParams.set('q', query)
    }
    searchUrl.searchParams.set('maxResults', maxResults.toString())

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text()
      return {
        content: [
          {
            type: 'text' as const,
            text: `Gmail search failed: ${searchResponse.status} ${searchResponse.statusText}\n${errorData}`,
          },
        ],
        isError: true,
      }
    }

    const searchData = await searchResponse.json()

    if (!searchData.messages || searchData.messages.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ messages: [], count: 0 }, null, 2),
          },
        ],
      }
    }

    const messagePromises = searchData.messages.map(async (message: { id: string }) => {
      const messageUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=${includeBody ? 'full' : 'metadata'}`

      const messageResponse = await fetch(messageUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!messageResponse.ok) {
        return null
      }

      const messageData = await messageResponse.json()
      return parseEmailMessage(messageData, includeBody)
    })

    const messages = (await Promise.all(messagePromises)).filter(Boolean) as EmailMessage[]

    messages.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime()
      const dateB = new Date(b.date || 0).getTime()
      return dateB - dateA
    })

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ messages, count: messages.length }, null, 2),
        },
      ],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error searching emails: ${errorMessage}`,
        },
      ],
      isError: true,
    }
  }
}

function parseEmailMessage(message: GmailMessage, includeBody: boolean): EmailMessage {
  const headers = message.payload.headers || []

  const getHeader = (name: string) => {
    const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase())
    return header?.value
  }

  const result: EmailMessage = {
    id: message.id,
    threadId: message.threadId,
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To'),
    date: getHeader('Date'),
    snippet: message.snippet,
  }

  if (includeBody) {
    result.body = extractMessageBody(message.payload)
  }

  return result
}

function extractMessageBody(payload: GmailMessage['payload']): string {
  let body = ''

  if (payload.body?.data) {
    body += base64UrlDecode(payload.body.data)
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.body?.data && part.mimeType?.includes('text/plain')) {
        body += base64UrlDecode(part.body.data)
      }
    }
  }

  return body
}

function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const decoded = atob(base64)
    return decodeURIComponent(escape(decoded))
  } catch (error) {
    return ''
  }
}
