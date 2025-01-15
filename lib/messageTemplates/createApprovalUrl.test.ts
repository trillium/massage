import { createApprovalUrl } from './createApprovalUrl'
import { getHash } from '../hash'
import { OnSiteRequestType } from '../types'
import { generateFakeOnSiteRequest } from '../__tests__/__helpers__/generateFakeData'

jest.mock('../hash', () => ({
  getHash: jest.fn(() => 'mockedHash'),
}))

describe('createApprovalUrl', () => {
  it('should create the correct approval URL', () => {
    const headers = new Headers({
      origin: 'http://example.com',
    })
    const data: OnSiteRequestType = generateFakeOnSiteRequest()

    const result = createApprovalUrl({ headers, data })

    expect(result).toBe(
      `http://example.com/api/onsite/confirm/?data=${encodeURIComponent(
        JSON.stringify(data)
      )}&key=mockedHash`
    )
  })

  it('should use "?" as origin if headers.get("origin") is null', () => {
    const headers = new Headers({})
    const data: OnSiteRequestType = generateFakeOnSiteRequest()

    const result = createApprovalUrl({ headers, data })

    expect(result).toBe(
      `?/api/onsite/confirm/?data=${encodeURIComponent(JSON.stringify(data))}&key=mockedHash`
    )
  })
})
