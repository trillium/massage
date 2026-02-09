import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { searchSootheEmails } from '@/lib/gmail/searchSootheEmails'

// Mock the Gmail access token function
vi.mock('@/lib/gmail/getGmailAccessToken', () => ({
  default: vi.fn().mockResolvedValue('mock_access_token'),
}))

const originalFetch = global.fetch

function makeSootheMessage(
  id: string,
  body: string,
  internalDate: string,
  subject = "You're booked"
) {
  return {
    id,
    threadId: `thread_${id}`,
    labelIds: ['INBOX'],
    snippet: 'Soothe booking...',
    payload: {
      headers: [
        { name: 'Subject', value: subject },
        { name: 'From', value: 'bookings@soothe.com' },
      ],
      body: { data: btoa(body), size: body.length },
    },
    sizeEstimate: body.length,
    historyId: '12345',
    internalDate,
  }
}

describe('searchSootheEmails', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should search for soothe emails and parse booking information', async () => {
    const searchResponse = {
      messages: [{ id: 'msg_123' }, { id: 'msg_456' }],
    }

    const messageResponse1 = makeSootheMessage(
      'msg_123',
      '60 min - Couples Swedish massage for Olivia Mathis\n\nLocation\n5743 North Canvas Court, North Hollywood\nLos Angeles, CA 91601\n\n$83.00 + $ tip',
      '1724652461000',
      "You're booked with Olivia"
    )

    const messageResponse2 = makeSootheMessage(
      'msg_456',
      '90 min - Deep Tissue massage for Marcus Johnson\n\nLocation\n1234 Sunset Blvd, West Hollywood\nLos Angeles, CA 90046\n\n$95.50 + $ tip\n\nNotes: Client requests firm pressure',
      '1724652360000',
      "You're booked with Marcus"
    )

    ;(fetch as Mock)
      .mockResolvedValueOnce(new Response(JSON.stringify(searchResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(messageResponse1), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(messageResponse2), { status: 200 }))

    const { bookings, failedMessageIds } = await searchSootheEmails(10)

    expect(bookings).toHaveLength(2)
    expect(failedMessageIds).toHaveLength(0)

    // Check first booking (Olivia Mathis - most recent)
    expect(bookings[0]).toMatchObject({
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
    expect(bookings[1]).toMatchObject({
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

    const { bookings, failedMessageIds } = await searchSootheEmails(10)

    expect(bookings).toHaveLength(0)
    expect(failedMessageIds).toHaveLength(0)
  })

  it('should handle API errors gracefully', async () => {
    ;(fetch as Mock).mockResolvedValueOnce(new Response('Not Found', { status: 404 }))

    await expect(searchSootheEmails(10)).rejects.toThrow('Gmail search failed')
  })

  it('should track failed message IDs instead of silently dropping', async () => {
    const searchResponse = {
      messages: [{ id: 'msg_123' }, { id: 'msg_456' }],
    }

    const messageResponse1 = makeSootheMessage('msg_123', 'Test content', '1640995200000')

    ;(fetch as Mock)
      .mockResolvedValueOnce(new Response(JSON.stringify(searchResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(messageResponse1), { status: 200 }))
      .mockResolvedValueOnce(new Response('Server Error', { status: 500 }))

    const { bookings, failedMessageIds } = await searchSootheEmails(10)

    expect(bookings).toHaveLength(1)
    expect(failedMessageIds).toEqual(['msg_456'])
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch message msg_456')
    )
  })

  it('should correctly parse service names containing f, o, or r', async () => {
    const searchResponse = {
      messages: [{ id: 'msg_fr1' }, { id: 'msg_ar2' }, { id: 'msg_rf3' }],
    }

    // "French" contains f and r — the old [^for\n\r] regex would break on this
    const msgFrench = makeSootheMessage(
      'msg_fr1',
      '60 min - French Aromatherapy massage for Jean Dupont\n\n$75.00 + $ tip',
      '1724652461000'
    )

    // "Aromatherapy" contains o and r
    const msgAroma = makeSootheMessage(
      'msg_ar2',
      '90 min - Aromatherapy massage for Sarah Connor\n\n$90.00 + $ tip',
      '1724652360000'
    )

    // "Reflexology" contains r, f, o
    const msgReflex = makeSootheMessage(
      'msg_rf3',
      '60 min - Reflexology treatment for John Doe\n\n$70.00 + $ tip',
      '1724652260000'
    )

    ;(fetch as Mock)
      .mockResolvedValueOnce(new Response(JSON.stringify(searchResponse), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(msgFrench), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(msgAroma), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(msgReflex), { status: 200 }))

    const { bookings } = await searchSootheEmails(10)

    expect(bookings).toHaveLength(3)

    // French Aromatherapy should parse the full service description
    expect(bookings[0].duration).toBe(60)
    expect(bookings[0].clientName).toBe('Jean Dupont')
    expect(bookings[0].sessionType).toBe('Aromatherapy')

    // Aromatherapy should be recognized
    expect(bookings[1].duration).toBe(90)
    expect(bookings[1].clientName).toBe('Sarah Connor')
    expect(bookings[1].sessionType).toBe('Aromatherapy')

    // Reflexology — not in massageTypes list, full description captured
    expect(bookings[2].duration).toBe(60)
    expect(bookings[2].clientName).toBe('John Doe')
    expect(bookings[2].sessionType).toBe('Reflexology Treatment')
  })

  it('should rate-limit concurrent fetches to batches of 10', async () => {
    // Create 15 message IDs to verify batching
    const messageIds = Array.from({ length: 15 }, (_, i) => ({ id: `msg_${i}` }))
    const searchResponse = { messages: messageIds }

    const mockMessages = messageIds.map((m, i) =>
      makeSootheMessage(
        m.id,
        `60 min - Swedish massage for Client ${i}\n\n$80.00 + $ tip`,
        `${1724652461000 - i * 1000}`
      )
    )

    const fetchMock = fetch as Mock
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(searchResponse), { status: 200 }))
    for (const msg of mockMessages) {
      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(msg), { status: 200 }))
    }

    const { bookings } = await searchSootheEmails(20)

    // All 15 should be fetched (1 search + 15 messages = 16 calls)
    expect(fetch).toHaveBeenCalledTimes(16)
    expect(bookings).toHaveLength(15)
  })
})
