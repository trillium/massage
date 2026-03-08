/**
 * generate-handbills.ts
 *
 * Generates unique QR codes for print using the native renderer (eyelet shapes).
 *
 * - Slugs are recorded in redirects.jsonl (source of truth for used hashes)
 * - Skips any slug that already has a SVG in print/qr/ (safe to re-run)
 * - Also regenerates SVGs for existing redirects with missing files (--regen)
 *
 * Usage:
 *   pnpm tsx scripts/generate-handbills.ts                                          # 6 handbill_ → airbnb promo
 *   pnpm tsx scripts/generate-handbills.ts --prefix=handbiz_ --dest=/quicklinks      # 6 handbiz_ → quicklinks
 *   pnpm tsx scripts/generate-handbills.ts --prefix=handbiz_ --count=0 --regen       # regenerate missing SVGs only
 *   pnpm tsx scripts/generate-handbills.ts --count=20                                # generate 20
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
const BASE_URL = 'https://trilliummassage.la/redirect'

function arg(name: string, fallback: string): string {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`))
  return found ? found.split('=').slice(1).join('=') : fallback
}

const PREFIX = arg('prefix', 'handbill_')
const DESTINATION = arg(
  'dest',
  'https://trilliummassage.la/blog/airbnb-host-promo-2026-03'
).replace(/^\//, 'https://trilliummassage.la/')
const COUNT = parseInt(arg('count', '6'), 10)
const REGEN = process.argv.includes('--regen')

function randomSlug(): string {
  return PREFIX + crypto.randomBytes(4).toString('hex')
}

function readRedirects(): Array<{ source: string; destination: string }> {
  if (!fs.existsSync(REDIRECTS_PATH)) return []
  return fs
    .readFileSync(REDIRECTS_PATH, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l))
}

function usedSlugs(redirects: Array<{ source: string }>): Set<string> {
  return new Set(redirects.map((r) => r.source.replace('/redirect/', '')))
}

function generateSlugs(n: number, used: Set<string>): string[] {
  const slugs: string[] = []
  while (slugs.length < n) {
    const s = randomSlug()
    if (!used.has(s) && !slugs.includes(s)) slugs.push(s)
  }
  return slugs
}

async function main() {
  fs.mkdirSync(QR_DIR, { recursive: true })

  const redirects = readRedirects()
  const used = usedSlugs(redirects)

  // Generate new slugs
  const newSlugs = generateSlugs(COUNT, used)
  if (newSlugs.length > 0) {
    const newLines = newSlugs.map((slug) =>
      JSON.stringify({ source: `/redirect/${slug}`, destination: DESTINATION, permanent: false })
    )
    fs.appendFileSync(REDIRECTS_PATH, '\n' + newLines.join('\n') + '\n')
    console.log(`Recorded ${newSlugs.length} new ${PREFIX}* slugs in redirects.jsonl`)
  }

  // Collect all slugs that need SVGs (new + existing with missing files if --regen)
  const toRender: string[] = [...newSlugs]

  if (REGEN) {
    const existingSlugs = redirects
      .filter((r) => r.source.includes(`/${PREFIX}`))
      .map((r) => r.source.replace('/redirect/', ''))
      .filter((slug) => !fs.existsSync(path.join(QR_DIR, `${slug}.svg`)))
    toRender.push(...existingSlugs.filter((s) => !toRender.includes(s)))
    if (existingSlugs.length) console.log(`Regenerating ${existingSlugs.length} missing SVGs`)
  }

  let generated = 0
  let skipped = 0
  for (let i = 0; i < toRender.length; i++) {
    const slug = toRender[i]
    const file = path.join(QR_DIR, `${slug}.svg`)

    if (fs.existsSync(file)) {
      skipped++
      continue
    }

    const url = `${BASE_URL}/${slug}`
    process.stdout.write(`  [${i + 1}/${toRender.length}] ${slug}… `)
    const svg = await generateNativeQRSvg(url)
    fs.writeFileSync(file, svg)
    generated++
    process.stdout.write('✓\n')
  }

  if (skipped) console.log(`  (${skipped} already existed, skipped)`)
  console.log(`\n✓ ${generated} generated · ${PREFIX}* → ${DESTINATION}`)
}

main()
