import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

interface Redirect {
  source: string
  destination: string
  permanent: boolean
}

let cachedRedirects: Redirect[] | null = null

function loadRedirects(): Redirect[] {
  if (cachedRedirects) return cachedRedirects
  const redirectsPath = join(process.cwd(), 'redirects.jsonl')
  const lines = readFileSync(redirectsPath, 'utf-8').trim().split('\n').filter(Boolean)
  cachedRedirects = lines.map((line) => JSON.parse(line))
  return cachedRedirects
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const redirects = loadRedirects()

  const match = redirects.find(
    (r) => r.source === `/rd/${slug}` || r.source === `/redirect/${slug}`
  )

  if (!match) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.redirect(match.destination, match.permanent ? 308 : 307)
}
