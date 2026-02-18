import { NextResponse, type NextRequest } from 'next/server'
import { processReminders } from '@/lib/reminders/processReminders'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expectedToken = process.env.REMINDER_CRON_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await processReminders()
  return NextResponse.json(result)
}
