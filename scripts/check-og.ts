#!/usr/bin/env bun
/**
 * check-og — verify a deployed OG image is rendering correctly
 *
 * Usage:
 *   pnpm check-og <slug> [--env=prod|test|local] [--no-open]
 *
 * Examples:
 *   pnpm check-og rachel-birthday-2026
 *   pnpm check-og rachel-birthday-2026 --env=prod
 *   pnpm check-og rachel-birthday-2026 --no-open
 */

import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const HOSTS: Record<string, string> = {
  prod: 'https://trilliummassage.la',
  test: 'https://test.trilliummassage.la',
  local: 'http://localhost:9876',
}

const MIN_HEALTHY_BYTES = 100_000

function parseArgs() {
  const args = process.argv.slice(2)
  const slug = args.find((a) => !a.startsWith('--'))
  const envFlag = args.find((a) => a.startsWith('--env='))?.split('=')[1] ?? 'test'
  const noOpen = args.includes('--no-open')
  return { slug, env: envFlag, noOpen }
}

async function fetchOgImageUrl(pageUrl: string): Promise<string | null> {
  const res = await fetch(pageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OGImageChecker/1.0)' },
  })
  const html = await res.text()
  const match = html.match(/property="og:image"\s+content="([^"]+)"/)
  return match?.[1] ?? null
}

async function fetchImage(url: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OGImageChecker/1.0)' },
  })
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url}`)
  const contentType = res.headers.get('content-type') ?? 'image/png'
  const bytes = new Uint8Array(await res.arrayBuffer())
  return { bytes, contentType }
}

function sizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function main() {
  const { slug, env, noOpen } = parseArgs()

  if (!slug) {
    console.error('Usage: pnpm check-og <slug> [--env=prod|test|local] [--no-open]')
    process.exit(1)
  }

  const host = HOSTS[env]
  if (!host) {
    console.error(`Unknown env "${env}". Use: prod, test, local`)
    process.exit(1)
  }

  const pageUrl = `${host}/${slug}`
  const imageUrl = `${host}/${slug}/opengraph-image`

  console.log(`\n🔍 Checking OG for: ${slug}`)
  console.log(`   env: ${env} (${host})`)
  console.log('')

  // 1. Check what og:image the page metadata declares
  process.stdout.write('  og:image meta tag ... ')
  const declaredImageUrl = await fetchOgImageUrl(pageUrl)
  if (!declaredImageUrl) {
    console.log('❌  not found in page HTML')
  } else {
    const isExpected = declaredImageUrl.includes(`/${slug}/opengraph-image`)
    console.log(isExpected ? `✅  ${declaredImageUrl}` : `⚠️   ${declaredImageUrl} (unexpected)`)
  }

  // 2. Fetch the rendered OG image directly
  process.stdout.write('  image endpoint      ... ')
  let imageBytes: Uint8Array
  try {
    const { bytes } = await fetchImage(imageUrl)
    imageBytes = bytes

    const size = bytes.byteLength
    const healthy = size >= MIN_HEALTHY_BYTES
    const label = sizeLabel(size)
    const verdict = healthy ? `✅  ${label}` : `❌  ${label} (too small — photo likely missing)`
    console.log(verdict)
  } catch (e) {
    console.log(`❌  fetch failed: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }

  // 3. Save and open
  const outPath = join(tmpdir(), `og-${slug}.png`)
  writeFileSync(outPath, imageBytes)
  console.log(`\n  saved to: ${outPath}`)

  if (!noOpen) {
    try {
      execSync(`open "${outPath}"`)
      console.log('  opened in Preview ↗\n')
    } catch {
      console.log('  (could not open Preview — run manually)\n')
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
