import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

vi.mock('lib/fetch/fetchSingleEvent', () => ({
  fetchSingleEvent: vi.fn(),
}))

import { fetchSingleEvent } from 'lib/fetch/fetchSingleEvent'

const DEFAULT_EVENT_ID = 'test-primary-event-id'

beforeEach(() => {
  process.env.GOOGLE_MAPS_CAL_PRIMARY_EVENT_ID = DEFAULT_EVENT_ID
  delete process.env.GOOGLE_MAPS_API_KEY
})

function postRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/driveTime', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function getRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/driveTime')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new NextRequest(url)
}

describe('/api/driveTime', () => {
  describe('POST', () => {
    it('returns drive time with userLocation', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'ev1',
        location: '123 Main St, LA',
      } as never)

      const res = await POST(postRequest({ userLocation: '456 Oak Ave, LA' }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(typeof json.driveTimeMinutes).toBe('number')
      expect(json.eventLocation).toBe('123 Main St, LA')
      expect(json.userLocation).toBe('456 Oak Ave, LA')
      expect(fetchSingleEvent).toHaveBeenCalledWith(DEFAULT_EVENT_ID)
    })

    it('returns drive time with userCoordinates', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'ev1',
        location: '123 Main St, LA',
      } as never)

      const res = await POST(postRequest({ userCoordinates: { lat: 34.05, lng: -118.25 } }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.userLocation).toBe('34.05,-118.25')
    })

    it('uses explicit eventId when provided', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'custom-id',
        location: '789 Elm St',
      } as never)

      await POST(postRequest({ eventId: 'custom-id', userLocation: 'somewhere' }))

      expect(fetchSingleEvent).toHaveBeenCalledWith('custom-id')
    })

    it('returns 400 when both userLocation and userCoordinates are missing', async () => {
      const res = await POST(postRequest({}))
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toContain('userLocation or userCoordinates is required')
    })

    it('returns 404 when event is not found', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue(null)

      const res = await POST(postRequest({ userLocation: 'somewhere' }))
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.error).toContain('Event not found')
    })

    it('returns 400 when event has no location', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'ev1',
        location: undefined,
      } as never)

      const res = await POST(postRequest({ userLocation: 'somewhere' }))
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toContain('does not have a location')
    })

    it('calls Google Maps API when api key is set', async () => {
      process.env.GOOGLE_MAPS_API_KEY = 'test-key'
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'ev1',
        location: '123 Main St',
      } as never)

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'OK',
          rows: [
            {
              elements: [
                {
                  status: 'OK',
                  duration: { value: 1800 },
                  duration_in_traffic: { value: 2400 },
                },
              ],
            },
          ],
        }),
      } as Response)

      const res = await POST(postRequest({ userLocation: '456 Oak Ave' }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.driveTimeMinutes).toBe(40)
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('distancematrix'))
    })

    it('falls back to mock when Google Maps API fails', async () => {
      process.env.GOOGLE_MAPS_API_KEY = 'test-key'
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'ev1',
        location: '123 Main St',
      } as never)

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('network error'))

      const res = await POST(postRequest({ userLocation: '456 Oak Ave' }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(typeof json.driveTimeMinutes).toBe('number')
    })

    it('returns 500 on unexpected error', async () => {
      vi.mocked(fetchSingleEvent).mockRejectedValue(new Error('boom'))

      const res = await POST(postRequest({ userLocation: 'somewhere' }))
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.error).toBe('Failed to calculate drive time')
    })
  })

  describe('GET', () => {
    it('returns drive time with userLocation param', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'ev1',
        location: '123 Main St, LA',
      } as never)

      const res = await GET(getRequest({ userLocation: '456 Oak Ave, LA' }))
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(typeof json.driveTimeMinutes).toBe('number')
    })

    it('returns 400 when userLocation param is missing', async () => {
      const res = await GET(getRequest({}))
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toContain('userLocation query parameter is required')
    })

    it('returns 404 when event is not found', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue(null)

      const res = await GET(getRequest({ userLocation: 'somewhere' }))
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.error).toContain('Event not found')
    })

    it('returns 400 when event has no location', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'ev1',
        location: undefined,
      } as never)

      const res = await GET(getRequest({ userLocation: 'somewhere' }))
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.error).toContain('does not have a location')
    })

    it('uses explicit eventId param', async () => {
      vi.mocked(fetchSingleEvent).mockResolvedValue({
        id: 'custom',
        location: 'somewhere',
      } as never)

      await GET(getRequest({ userLocation: 'here', eventId: 'custom' }))

      expect(fetchSingleEvent).toHaveBeenCalledWith('custom')
    })

    it('returns 500 on unexpected error', async () => {
      vi.mocked(fetchSingleEvent).mockRejectedValue(new Error('boom'))

      const res = await GET(getRequest({ userLocation: 'somewhere' }))
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.error).toBe('Failed to calculate drive time')
    })
  })
})
