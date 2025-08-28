import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { searchSootheEmails } from '../searchSootheEmails'

// Mock the Gmail access token function
vi.mock('../getGmailAccessToken', () => ({
  default: vi.fn().mockResolvedValue('mock_access_token'),
}))

const originalFetch = global.fetch

describe('searchSootheEmails', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllMocks()
  })

  it('should search for soothe emails and parse booking information', async () => {
    // Mock search response
    const searchResponse = {
      messages: [{ id: 'msg_123' }, { id: 'msg_456' }],
    }

    // Mock message responses based on real Soothe booking data
    const messageResponse1 = {
      id: 'msg_123',
      threadId: 'thread_123',
      labelIds: ['INBOX'],
      snippet: 'Your massage booking with Olivia Mathis...',
      payload: {
        headers: [
          { name: 'Subject', value: "You're booked with Olivia" },
          { name: 'From', value: 'bookings@soothe.com' },
        ],
        body: {
          data: btoa(
            '60 min - Couples Swedish massage for Olivia Mathis\n\nLocation\n5743 North Canvas Court, North Hollywood\nLos Angeles, CA 91601\n\n$83.00 + $ tip'
          ),
          size: 200,
        },
      },
      sizeEstimate: 200,
      historyId: '12345',
      internalDate: '1724652461000', // 2025-08-26T05:27:41.000Z
    }

    const messageResponse2 = {
      id: 'msg_456',
      threadId: 'thread_456',
      labelIds: ['INBOX'],
      snippet: 'Your massage appointment...',
      payload: {
        headers: [
          { name: 'Subject', value: "You're booked with Marcus" },
          { name: 'From', value: 'bookings@soothe.com' },
        ],
        body: {
          data: btoa(
            '90 min - Deep Tissue massage for Marcus Johnson\n\nLocation\n1234 Sunset Blvd, West Hollywood\nLos Angeles, CA 90046\n\n$95.50 + $ tip\n\nNotes: Client requests firm pressure'
          ),
          size: 180,
        },
      },
      sizeEstimate: 180,
      historyId: '12346',
      internalDate: '1724652360000', // Earlier timestamp so it comes second
    }

    // Setup fetch mocks
    ;(fetch as Mock)
      .mockResolvedValueOnce(new Response(JSON.stringify(searchResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(messageResponse1), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(messageResponse2), { status: 200 }))

    const results = await searchSootheEmails(10)

    expect(results).toHaveLength(2)

    // Check first booking (Olivia Mathis - most recent)
    expect(results[0]).toMatchObject({
      clientName: 'Olivia Mathis',
      sessionType: 'Swedish',
      duration: 60,
      isCouples: true,
      location: '5743 North Canvas Court, North Hollywood\nLos Angeles, CA 91601',
      payout: 83,
      tip: 0,
      extraServices: [],
    })

    // Check second booking (Marcus Johnson)
    expect(results[1]).toMatchObject({
      clientName: 'Marcus Johnson',
      sessionType: 'Deep Tissue',
      duration: 90,
      isCouples: false,
      location: '1234 Sunset Blvd, West Hollywood\nLos Angeles, CA 90046',
      payout: 95.5,
      tip: 0,
      notes: 'Client requests firm pressure',
    })

    // Verify API calls
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('gmail/v1/users/me/messages'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock_access_token' },
      })
    )
  })

  it('should handle empty search results', async () => {
    ;(fetch as Mock).mockResolvedValueOnce(
      new Response(JSON.stringify({ messages: [] }), { status: 200 })
    )

    const results = await searchSootheEmails(10)

    expect(results).toHaveLength(0)
  })

  it('should handle API errors gracefully', async () => {
    ;(fetch as Mock).mockResolvedValueOnce(new Response('Not Found', { status: 404 }))

    await expect(searchSootheEmails(10)).rejects.toThrow('Gmail search failed')
  })

  it('should handle message fetch errors gracefully', async () => {
    const searchResponse = {
      messages: [{ id: 'msg_123' }, { id: 'msg_456' }],
    }

    const messageResponse1 = {
      id: 'msg_123',
      threadId: 'thread_123',
      labelIds: ['INBOX'],
      snippet: 'Valid message...',
      payload: {
        headers: [{ name: 'Subject', value: 'Test' }],
        body: { data: btoa('Test content'), size: 12 },
      },
      sizeEstimate: 12,
      historyId: '12345',
      internalDate: '1640995200000',
    }

    ;(fetch as Mock)
      .mockResolvedValueOnce(new Response(JSON.stringify(searchResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(messageResponse1), { status: 200 }))
      .mockResolvedValueOnce(new Response('Server Error', { status: 500 }))

    const results = await searchSootheEmails(10)

    // Should still return the successfully fetched message
    expect(results).toHaveLength(1)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch message msg_456')
    )
  })
})
