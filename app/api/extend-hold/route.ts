import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { extendSlotHold } from '@/lib/holds/extendSlotHold'

const ExtendHoldSchema = z.object({
  sessionId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ExtendHoldSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const result = await extendSlotHold(parsed.data.sessionId)

  if (result.extended) {
    return NextResponse.json({ extended: true })
  }

  return NextResponse.json({ extended: false, reason: result.reason }, { status: 410 })
}
