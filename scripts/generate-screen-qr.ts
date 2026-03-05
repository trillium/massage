/**
 * generate-screen-qr.ts
 *
 * Generates a single screen QR code for standalone display/print.
 * - Creates a screen_{hash} slug with 8-char random hex
 * - Records redirect in redirects.jsonl
 * - Generates QR SVG via generate-qr-native.ts (visual guidelines)
 * - Prints the slug to stdout for downstream use (PDF generation)
 *
 * Usage:
 *   pnpm tsx scripts/generate-screen-qr.ts
 */
import crypto from 'node:crypto'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const REDIRECTS_PATH = path.join(REPO_ROOT, 'redirects.jsonl')
const QR_DIR = path.join(REPO_ROOT, 'print', 'qr')

const DESTINATION = 'https://trilliummassage.la/quicklinks'
const BASE_URL = 'https://trilliummassage.la/redirect'

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

async function main() {
  fs.mkdirSync(QR_DIR, { recursive: true })

  const used = usedSlugs()
  let slug: string
  do {
    slug = 'screen_' + crypto.randomBytes(4).toString('hex')
  } while (used.has(slug))

  const url = `${BASE_URL}/${slug}`
  const svgPath = path.join(QR_DIR, `${slug}.svg`)

  const redirect = JSON.stringify({
    source: `/redirect/${slug}`,
    destination: DESTINATION,
    permanent: false,
  })
  fs.appendFileSync(REDIRECTS_PATH, redirect + '\n')

  const nativeScript = path.join(__dirname, 'generate-qr-native.ts')
  execSync(`pnpm tsx "${nativeScript}" "${url}" "${svgPath}"`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  })

  console.log(slug)
}

main()
