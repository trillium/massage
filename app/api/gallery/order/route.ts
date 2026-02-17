import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { AdminAuthManager } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  const auth = AdminAuthManager.requireAdmin(request)
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
