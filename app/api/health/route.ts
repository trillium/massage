import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      return NextResponse.json(
        { status: 'degraded', timestamp, supabase: 'error', detail: error.message },
        { status: 503 }
      )
    }

    return NextResponse.json({ status: 'ok', timestamp, supabase: 'connected' })
  } catch (err) {
    return NextResponse.json(
      { status: 'error', timestamp, supabase: 'unreachable' },
      { status: 503 }
    )
  }
}
