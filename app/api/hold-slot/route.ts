import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { claimSlotHold } from '@/lib/holds/claimSlotHold'

const HoldSlotSchema = z.object({
  sessionId: z.string().uuid(),
  start: z.string().datetime(),
  end: z.string().datetime(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = HoldSlotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const { sessionId, start, end } = parsed.data
  const result = await claimSlotHold(sessionId, start, end)

  if (result.success) {
    return NextResponse.json({ success: true, holdId: result.holdId })
  }

  return NextResponse.json({ success: false, reason: result.reason }, { status: 409 })
}
