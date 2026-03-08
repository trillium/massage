/**
 * generate-handbills.ts
 *
 * Generates unique handbill QR codes for print using the local renderer.
 * No external API — uses lib/qr/generate.ts (qr-code-styling + JSDOM).
 *
 * - Slugs are recorded in redirects.jsonl (source of truth for used hashes)
 * - Skips any slug that already has a SVG in print/qr/ (safe to re-run)
 * - Writes print/index.html grid of all codes
 *
 * Usage:
 *   pnpm tsx scripts/generate-handbills.ts                          # 17 handbill_ codes
 *   pnpm tsx scripts/generate-handbills.ts --count=85               # generate N more
 *   pnpm tsx scripts/generate-handbills.ts --prefix=mbc_ --count=10 # 10 business card codes
 *   pnpm tsx scripts/generate-handbills.ts --prefix=mbc_ --count=10 --destination=https://trilliummassage.la
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateNativeQRSvg } from '../lib/qr/generate-native'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const REDIRECTS_PATH = path.join(REPO_ROOT, 'redirects.jsonl')
const PRINT_DIR = path.join(REPO_ROOT, 'print')
const QR_DIR = path.join(PRINT_DIR, 'qr')

const DEFAULT_DESTINATION = 'https://trilliummassage.la/blog/airbnb-host-promo-2026-03'
const BASE_URL = 'https://trilliummassage.la/redirect'

const countArg = process.argv.find((a) => a.startsWith('--count='))
const COUNT = countArg ? parseInt(countArg.split('=')[1], 10) : 17

const prefixArg = process.argv.find((a) => a.startsWith('--prefix='))
const PREFIX = prefixArg ? prefixArg.split('=')[1] : 'handbill_'

const destArg = process.argv.find((a) => a.startsWith('--destination='))
const DESTINATION = destArg ? destArg.split('=')[1] : DEFAULT_DESTINATION

// ─── Slug tracking ───────────────────────────────────────────────────────────

function randomSlug(): string {
  return PREFIX + crypto.randomBytes(4).toString('hex')
}

/** All slugs recorded in redirects.jsonl — the canonical used-hash ledger */
function usedSlugs(): Set<string> {
  if (!fs.existsSync(REDIRECTS_PATH)) return new Set()
  return new Set(
    fs
      .readFileSync(REDIRECTS_PATH, 'utf-8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l).source.replace('/redirect/', ''))
  )
}

function generateSlugs(n: number, used: Set<string>): string[] {
  const slugs: string[] = []
  while (slugs.length < n) {
    const s = randomSlug()
    if (!used.has(s) && !slugs.includes(s)) slugs.push(s)
  }
  return slugs
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(QR_DIR, { recursive: true })

  const used = usedSlugs()
  const slugs = generateSlugs(COUNT, used)

  // Write redirects first — redirects.jsonl is the record of used hashes
  const newLines = slugs.map((slug) =>
    JSON.stringify({ source: `/redirect/${slug}`, destination: DESTINATION, permanent: false })
  )
  fs.appendFileSync(REDIRECTS_PATH, '\n' + newLines.join('\n') + '\n')
  console.log(`Recorded ${slugs.length} new slugs in redirects.jsonl`)

  // Generate SVGs locally — skip any that already exist (resume-safe)
  const results: Array<{ slug: string }> = []
  let skipped = 0

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i]
    const file = path.join(QR_DIR, `${slug}.svg`)

    if (fs.existsSync(file)) {
      skipped++
      continue
    }

    const url = `${BASE_URL}/${slug}`
    process.stdout.write(`  [${i + 1}/${slugs.length}] ${slug}… `)
    const svg = await generateNativeQRSvg(url)
    fs.writeFileSync(file, svg)
    results.push({ slug })
    process.stdout.write('✓\n')
  }

  if (skipped) console.log(`  (${skipped} already existed, skipped)`)

  // Update index.html with ALL handbill SVGs in print/qr/
  const allSlugs = fs
    .readdirSync(QR_DIR)
    .filter((f) => f.startsWith(PREFIX) && f.endsWith('.svg'))
    .map((f) => f.replace('.svg', ''))
    .sort()

  const cards = allSlugs
    .map(
      (slug) => `
  <div class="card">
    <img src="qr/${slug}.svg" alt="${slug}">
    <div class="slug">${slug}</div>
    <div class="url">${BASE_URL}/${slug}</div>
  </div>`
    )
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Handbill QR Codes — Airbnb Promo 2026-03</title>
<style>
  body { font-family: monospace; background: #1a1a1a; color: #eee; margin: 0; padding: 24px; }
  h1 { color: #ffbd4a; margin-bottom: 4px; }
  p { color: #666; font-size: 12px; margin: 0 0 24px; }
  .grid { display: flex; flex-wrap: wrap; gap: 20px; }
  .card { background: #222; border-radius: 6px; padding: 12px; width: 180px; }
  .card img { width: 100%; display: block; border-radius: 4px; }
  .slug { color: #2dd4bf; font-size: 11px; margin-top: 8px; word-break: break-all; }
  .url { color: #444; font-size: 10px; margin-top: 2px; word-break: break-all; }
</style>
</head>
<body>
<h1>Handbill QR Codes</h1>
<p>→ ${DESTINATION}<br>${allSlugs.length} unique codes · generated ${new Date().toISOString().slice(0, 10)}</p>
<div class="grid">
${cards}
</div>
</body>
</html>`

  fs.writeFileSync(path.join(PRINT_DIR, 'index.html'), html)
  console.log(`\n✓ ${results.length} generated · ${allSlugs.length} total in print/qr/`)
  console.log(`  Hashes tracked in: redirects.jsonl`)
}

main()
