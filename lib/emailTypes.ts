export type SendMailParams = {
  to: string
  subject: string
  body: string
}

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

export interface SootheEmailSearchResult {
  bookings: SootheBookingInfo[]
  failedMessageIds: string[]
}
