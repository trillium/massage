import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { releaseSlotHold } from '@/lib/holds/releaseSlotHold'

const ReleaseHoldSchema = z.object({
  sessionId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ReleaseHoldSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  await releaseSlotHold(parsed.data.sessionId)
  return NextResponse.json({ success: true })
}
