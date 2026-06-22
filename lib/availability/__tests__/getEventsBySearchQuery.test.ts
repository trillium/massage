import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getEventsBySearchQuery } from '../getEventsBySearchQuery'

vi.mock('../getAccessToken', () => ({
  default: vi.fn(),
  clearTokenCache: vi.fn(),
}))

const { default: getAccessToken, clearTokenCache } = await import('../getAccessToken')

describe('getEventsBySearchQuery', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.mocked(getAccessToken).mockReset()
    vi.mocked(clearTokenCache).mockReset()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns events on a successful first fetch', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('valid-token')
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ items: [{ id: 'evt-1' }] }),
    })) as unknown as typeof fetch

    const events = await getEventsBySearchQuery({ query: 'test' })
    expect(events).toEqual([{ id: 'evt-1' }])
    expect(getAccessToken).toHaveBeenCalledTimes(1)
    expect(clearTokenCache).not.toHaveBeenCalled()
  })

  it('clears the cache and retries once on 401, returning the second response', async () => {
    vi.mocked(getAccessToken)
      .mockResolvedValueOnce('stale-token')
      .mockResolvedValueOnce('fresh-token')

    let call = 0
    global.fetch = vi.fn(async () => {
      call++
      if (call === 1) {
        return {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({}),
        } as Response
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ items: [{ id: 'evt-after-refresh' }] }),
      } as Response
    }) as unknown as typeof fetch

    const events = await getEventsBySearchQuery({ query: 'test' })
    expect(events).toEqual([{ id: 'evt-after-refresh' }])
    expect(getAccessToken).toHaveBeenCalledTimes(2)
    expect(clearTokenCache).toHaveBeenCalledTimes(1)
    expect(call).toBe(2)
  })

  it('throws after retry when the second fetch is also 401 (real auth failure)', async () => {
    vi.mocked(getAccessToken)
      .mockResolvedValueOnce('stale-token')
      .mockResolvedValueOnce('fresh-token')

    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({}),
    })) as unknown as typeof fetch

    await expect(getEventsBySearchQuery({ query: 'test' })).rejects.toThrow(
      /Error fetching events: Unauthorized/
    )
    expect(clearTokenCache).toHaveBeenCalledTimes(1)
  })

  it('does not retry on non-401 errors (500, 403, etc.)', async () => {
    vi.mocked(getAccessToken).mockResolvedValue('valid-token')

    let call = 0
    global.fetch = vi.fn(async () => {
      call++
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response
    }) as unknown as typeof fetch

    await expect(getEventsBySearchQuery({ query: 'test' })).rejects.toThrow(/Internal Server Error/)
    expect(clearTokenCache).not.toHaveBeenCalled()
    expect(call).toBe(1)
  })

  it('respects USE_MOCK_CALENDAR_DATA=true short-circuit', async () => {
    const prev = process.env.USE_MOCK_CALENDAR_DATA
    process.env.USE_MOCK_CALENDAR_DATA = 'true'
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('should not be called'))
    ) as unknown as typeof fetch
    const result = await getEventsBySearchQuery({ query: 'test' })
    expect(result).toEqual([])
    expect(getAccessToken).not.toHaveBeenCalled()
    process.env.USE_MOCK_CALENDAR_DATA = prev
  })
})
