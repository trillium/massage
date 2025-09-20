import { describe, it, expect, vi } from 'vitest'
import { createOnsiteApprovalUrl } from './createApprovalUrl'
import { getHash } from '@/lib/hash'
import { OnSiteRequestType } from '@/lib/types'
import { generateFakeOnSiteRequest } from '@/lib/messaging/__tests__/__helpers__/generateFakeData'

vi.mock('@/lib/hash', () => ({
  getHash: vi.fn(() => 'mockedHash'),
}))

describe('createOnsiteApprovalUrl', () => {
  it('should create the correct approval URL', () => {
    const headers = new Headers({
      origin: 'http://example.com',
    })
    const data: OnSiteRequestType = generateFakeOnSiteRequest()

    const result = createOnsiteApprovalUrl({ headers, data })

    expect(result).toBe(
      `http://example.com/api/onsite/confirm/?data=${encodeURIComponent(
        JSON.stringify(data)
      )}&key=mockedHash`
    )
  })

  it('should use "?" as origin if headers.get("origin") is null', () => {
    const headers = new Headers({})
    const data: OnSiteRequestType = generateFakeOnSiteRequest()

    const result = createOnsiteApprovalUrl({ headers, data })

    expect(result).toBe(
      `?/api/onsite/confirm/?data=${encodeURIComponent(JSON.stringify(data))}&key=mockedHash`
    )
  })
})
