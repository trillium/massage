import { AppointmentRequestSchema } from '@/lib/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // This is a mock endpoint that just returns success
  // In the real flow, this would be handled by /api/request

  const jsonData = await req.json()

  // Validate and send pushover message if valid
  const parseResult = AppointmentRequestSchema.safeParse(jsonData)
  console.log(parseResult)

  // Simulate a brief delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return NextResponse.json({ success: true }, { status: 200 })
}
