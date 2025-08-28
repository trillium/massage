import getGmailAccessToken from './getGmailAccessToken'

export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    headers: Array<{
      name: string
      value: string
    }>
    body: {
      data?: string
      size: number
    }
    parts?: Array<{
      mimeType: string
      body: {
        data?: string
        size: number
      }
    }>
  }
  sizeEstimate: number
  historyId: string
  internalDate: string
}

export interface SootheBookingInfo {
  clientName?: string
  sessionType?: string
  duration?: number
  isCouples?: boolean
  location?: string
  payout?: number
  tip?: number
  notes?: string
  extraServices?: string[]
  rawMessage: GmailMessage
}

/**
 * Searches Gmail for messages containing "soothe" and extracts booking information
 * @param maxResults - Maximum number of messages to retrieve (default: 50)
 * @param daysBack - Number of days back to search (default: 1 day)
 * @returns Array of parsed Soothe booking information
 */
export async function searchSootheEmails(
  maxResults: number = 50,
  daysBack: number = 1
): Promise<SootheBookingInfo[]> {
  const accessToken = await getGmailAccessToken()

  // Calculate date for search query (1 day ago by default)
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - daysBack)
  const searchDate = dateFrom.toISOString().split('T')[0].replace(/-/g, '/')

  // Search for Soothe booking emails from the specified date
  const searchUrl = new URL('https://www.googleapis.com/gmail/v1/users/me/messages')
  searchUrl.searchParams.set('q', `from:soothe.com subject:"you're booked" after:${searchDate}`)
  searchUrl.searchParams.set('maxResults', maxResults.toString())

  const searchResponse = await fetch(searchUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!searchResponse.ok) {
    const errorData = await searchResponse.text()
    console.error('Gmail API Error Response:', errorData)
    throw new Error(
      `Gmail search failed: ${searchResponse.status} ${searchResponse.statusText} - ${errorData}`
    )
  }

  const searchData = await searchResponse.json()

  if (!searchData.messages || searchData.messages.length === 0) {
    return []
  }

  // Fetch full message details for each message
  const messagePromises = searchData.messages.map(async (message: { id: string }) => {
    const messageUrl = `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`

    const messageResponse = await fetch(messageUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!messageResponse.ok) {
      console.warn(`Failed to fetch message ${message.id}: ${messageResponse.status}`)
      return null
    }

    return messageResponse.json()
  })

  const messages = (await Promise.all(messagePromises)).filter(Boolean) as GmailMessage[]

  // Sort messages by date (most recent first)
  messages.sort((a, b) => {
    const dateA = parseInt(a.internalDate)
    const dateB = parseInt(b.internalDate)
    return dateB - dateA // Descending order (newest first)
  })

  // Parse each message for Soothe booking information
  const bookings = messages.map((message) => parseBookingInfo(message))

  return bookings
}

/**
 * Parses a Gmail message to extract Soothe booking information
 */
function parseBookingInfo(message: GmailMessage): SootheBookingInfo {
  const result: SootheBookingInfo = {
    rawMessage: message,
  }

  // Get message content
  const messageContent = getMessageContent(message)
  const subject = getHeader(message, 'Subject') || ''
  const from = getHeader(message, 'From') || ''

  // Extract client name from various possible formats
  result.clientName = extractClientName(messageContent, subject, from)

  // Extract session type and details
  const sessionInfo = extractSessionInfo(messageContent)
  result.sessionType = sessionInfo.sessionType
  result.duration = sessionInfo.duration
  result.isCouples = sessionInfo.isCouples

  // Extract location information
  result.location = extractLocation(messageContent)

  // Extract payout and tip information
  const earningsInfo = extractEarningsInfo(messageContent)
  result.payout = earningsInfo.payout
  result.tip = earningsInfo.tip

  // Extract notes
  result.notes = extractNotes(messageContent)

  // Extract extra services
  result.extraServices = extractExtraServices(messageContent)

  return result
}

/**
 * Extracts the text content from a Gmail message
 */
function getMessageContent(message: GmailMessage): string {
  let content = ''

  // Try to get content from message body
  if (message.payload.body.data) {
    content += base64UrlDecode(message.payload.body.data)
  }

  // Try to get content from message parts
  if (message.payload.parts) {
    for (const part of message.payload.parts) {
      if (
        part.body.data &&
        (part.mimeType.includes('text/plain') || part.mimeType.includes('text/html'))
      ) {
        content += base64UrlDecode(part.body.data)
      }
    }
  }

  return content
}

/**
 * Gets a header value from a Gmail message
 */
function getHeader(message: GmailMessage, headerName: string): string | undefined {
  const header = message.payload.headers.find(
    (h) => h.name.toLowerCase() === headerName.toLowerCase()
  )
  return header?.value
}

/**
 * Decodes base64url encoded string
 */
function base64UrlDecode(str: string): string {
  try {
    // Convert base64url to base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }

    // Decode base64
    const decoded = atob(base64)

    // Convert to UTF-8
    return decodeURIComponent(escape(decoded))
  } catch (error) {
    console.warn('Failed to decode base64url string:', error)
    return ''
  }
}

/**
 * Extracts client name from message content
 */
function extractClientName(content: string, subject: string, from: string): string | undefined {
  const text = `${content} ${subject} ${from}`

  // Look for "for [Name]" pattern in session descriptions
  const sessionForPattern = /(?:massage|therapy|treatment)\s+for\s+([A-Za-z\s]+?)(?:\s|$|\n|\r)/i
  const sessionMatch = text.match(sessionForPattern)
  if (sessionMatch && sessionMatch[1]) {
    return sessionMatch[1].trim()
  }

  // Common patterns for client names in Soothe emails
  const patterns = [
    /client[:\s]+([a-zA-Z\s]+?)[\n\r,]/i,
    /customer[:\s]+([a-zA-Z\s]+?)[\n\r,]/i,
    /name[:\s]+([a-zA-Z\s]+?)[\n\r,]/i,
    /booking\s+for[:\s]+([a-zA-Z\s]+?)[\n\r,]/i,
    /appointment\s+with[:\s]+([a-zA-Z\s]+?)[\n\r,]/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * Extracts session information (type, duration, couples status)
 */
function extractSessionInfo(content: string): {
  sessionType?: string
  duration?: string
  isCouples?: boolean
} {
  const result: { sessionType?: string; duration?: string; isCouples?: boolean } = {}

  // Look for session description pattern like "60 min - Couples Swedish Massage for Olivia Mathis"
  const sessionPattern = /(\d+)\s+min\s*[-–]\s*([^for\n\r]*?)(?:\s+for\s+|$|\n|\r)/i
  const match = content.match(sessionPattern)

  if (match) {
    result.duration = parseFloat(match[1])

    const serviceDescription = match[2]?.trim()
    if (serviceDescription) {
      // Check if it's couples
      result.isCouples = /couples?/i.test(serviceDescription)

      // Extract the actual massage type from the description
      const massageTypes = [
        'Swedish',
        'Deep Tissue',
        'Sports',
        'Chair',
        'Prenatal',
        'Hot Stone',
        'Aromatherapy',
      ]
      for (const massageType of massageTypes) {
        const regex = new RegExp(`\\b${massageType}(?:\\s+massage)?\\b`, 'i')
        if (regex.test(serviceDescription)) {
          result.sessionType = massageType
          break
        }
      }

      // If no specific massage type found, try to extract from the end of the description
      if (!result.sessionType) {
        // Remove "couples" and look for massage type at the end
        let cleanedType = serviceDescription.replace(/couples?\s*/i, '').trim()
        cleanedType = cleanedType.replace(/\s*massage\s*$/i, '').trim()

        // Check if the cleaned type matches known massage types
        const lowerCleanedType = cleanedType.toLowerCase()
        for (const massageType of massageTypes) {
          if (lowerCleanedType.includes(massageType.toLowerCase())) {
            result.sessionType = massageType
            break
          }
        }

        // If still no match, use the cleaned type as-is if it's reasonable
        if (!result.sessionType && cleanedType && cleanedType.length > 2) {
          result.sessionType = cleanedType.replace(/\b\w/g, (l) => l.toUpperCase())
        }
      }
    }
  } else {
    // Fallback: look for duration separately
    const durationPattern = /(\d+)\s+min/i
    const durationMatch = content.match(durationPattern)
    if (durationMatch) {
      result.duration = `${durationMatch[1]} min`
    }

    // Look for service types in broader context
    const massageTypes = [
      'Swedish',
      'Deep Tissue',
      'Sports',
      'Chair',
      'Prenatal',
      'Hot Stone',
      'Aromatherapy',
    ]
    for (const massageType of massageTypes) {
      const regex = new RegExp(`\\b${massageType}(?:\\s+massage)?\\b`, 'i')
      if (regex.test(content)) {
        result.sessionType = massageType
        break
      }
    }

    // Check for couples separately
    result.isCouples = /couples?/i.test(content)
  }

  return result
}

/**
 * Extracts earnings information (payout and tip)
 */
function extractEarningsInfo(content: string): { payout?: number; tip?: number } {
  const result: { payout?: number; tip?: number } = {}

  // Look for earnings pattern like "$83.00 + $ tip" or "$65.00 + $20.85 tip"
  const earningsPattern = /\$(\d+(?:\.\d{2})?)\s*\+\s*\$?\s*(\d+(?:\.\d{2})?)?\s*tip/i
  const match = content.match(earningsPattern)

  if (match) {
    result.payout = parseFloat(match[1])
    if (match[2]) {
      result.tip = parseFloat(match[2])
    } else {
      result.tip = 0
    }
  } else {
    // Fallback: look for any dollar amounts
    const dollarAmounts = content.match(/\$(\d+(?:\.\d{2})?)/g)
    if (dollarAmounts && dollarAmounts.length > 0) {
      result.payout = parseFloat(dollarAmounts[0])
    }
  }

  return result
}

/**
 * Extracts location information from message content
 */
function extractLocation(content: string): string | undefined {
  // Look for location section in "You're booked" emails
  const locationSectionPattern = /Location\s*\n\s*([^\n]+)\s*\n\s*([^\n]+)/i
  const locationMatch = content.match(locationSectionPattern)

  if (locationMatch) {
    const line1 = locationMatch[1]?.trim()
    const line2 = locationMatch[2]?.trim()
    if (line1 && line2) {
      return `${line1}\n${line2}`
    } else if (line1) {
      return line1
    }
  }

  // Fallback patterns
  const patterns = [
    /location[:\s]+([^\n\r]+(?:\n[^\n\r]+)?)/i,
    /address[:\s]+([^\n\r]+(?:\n[^\n\r]+)?)/i,
    /venue[:\s]+([^\n\r]+)/i,
    /\d+[^,\n\r]+,\s*[^,\n\r]+,\s*[A-Z]{2}\s+\d{5}/i, // Full address pattern
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * Extracts notes from message content
 */
function extractNotes(content: string): string | undefined {
  const patterns = [
    /notes?[:\s]+([^\n\r]+)/i,
    /special\s+requests?[:\s]+([^\n\r]+)/i,
    /comments?[:\s]+([^\n\r]+)/i,
    /instructions?[:\s]+([^\n\r]+)/i,
    /arrival\s+instructions[:\s]+([^\n\r]+)/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * Extracts extra services from message content
 */
function extractExtraServices(content: string): string[] {
  const services: string[] = []
  const text = content.toLowerCase()

  // Common extra services with more specific patterns
  const servicePatterns = [
    { pattern: /hot\s+stones?/i, service: 'Hot Stones' },
    { pattern: /scalp\s+massage/i, service: 'Scalp Massage' },
    { pattern: /deep\s+tissue/i, service: 'Deep Tissue' },
    { pattern: /aromatherapy/i, service: 'Aromatherapy' },
    { pattern: /prenatal/i, service: 'Prenatal' },
    { pattern: /reflexology/i, service: 'Reflexology' },
    { pattern: /trigger\s+point/i, service: 'Trigger Point' },
    { pattern: /myofascial/i, service: 'Myofascial Release' },
  ]

  for (const { pattern, service } of servicePatterns) {
    if (pattern.test(content)) {
      services.push(service)
    }
  }

  return services
}
