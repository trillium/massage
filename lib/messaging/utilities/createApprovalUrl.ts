import { getHash } from '../hash'
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers'
import { OnSiteRequestType } from '../types'

type ApprovalUrl = {
  headers: ReadonlyHeaders
  data: OnSiteRequestType
}

export function createApprovalUrl({ headers, data }: ApprovalUrl) {
  return `${headers.get('origin') ?? '?'}/api/onsite/confirm/?data=${encodeURIComponent(
    JSON.stringify(data)
  )}&key=${getHash(JSON.stringify(data))}`
}
