import { describe, it, expect, vi } from 'vitest'
import updateLocation from '@/lib/availability/updateLocation'

// Mock fetch globally
vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.resolve({ ok: true, json: () => ({}) }))
)
// Mock getAccessToken to avoid env dependency
vi.mock('@/lib/availability/getAccessToken', () => ({
  default: () => Promise.resolve('fake-token'),
}))

describe('updateLocation', () => {
  it('should include zipCode in the PATCH body if provided', async () => {
    const location = '123 Main St'
    const zipCode = '94110'
    await updateLocation({ location, zipCode })
    const mockedFetch = vi.mocked(fetch)
    const lastCall = mockedFetch.mock.calls[mockedFetch.mock.calls.length - 1]
    const requestInit = lastCall[1]
    const body = JSON.parse(requestInit?.body as string)
    expect(body.location).toBe(location)
    expect(body.zipCode).toBe(zipCode)
  })
})
