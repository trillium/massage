import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { requireAdminWithFlag } from '@/lib/adminAuthBridge'

export async function POST(request: NextRequest) {
  const auth = await requireAdminWithFlag(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { images, hidden } = await request.json()
    const filePath = join(process.cwd(), 'data', 'gallery-order.json')
    await writeFile(filePath, JSON.stringify({ images, hidden: hidden || [] }, null, 2))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Write failed' }, { status: 500 })
  }
}
