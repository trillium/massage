import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateNativeQRSvg } from '../lib/qr/generate-native'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const REDIRECTS_PATH = path.join(REPO_ROOT, 'redirects.jsonl')
const QR_DIR = path.join(REPO_ROOT, 'print', 'qr')
const BASE_URL = 'https://trilliummassage.la/redirect'

export interface PrintConfig {
  prefix: string
  destination: string
  count: number
  regen: boolean
}

export function parseArgs(defaults: PrintConfig): PrintConfig {
  function arg(name: string, fallback: string): string {
    const found = process.argv.find((a) => a.startsWith(`--${name}=`))
    return found ? found.split('=').slice(1).join('=') : fallback
  }

  const prefix = arg('prefix', '')
  if (!prefix) {
    console.error('Error: --prefix is required (e.g. --prefix=BC01-)')
    process.exit(1)
  }

  return {
    prefix,
    destination: arg('dest', defaults.destination).replace(/^\//, 'https://trilliummassage.la/'),
    count: parseInt(arg('count', String(defaults.count)), 10),
    regen: process.argv.includes('--regen'),
  }
}

function randomSlug(prefix: string): string {
  return prefix + crypto.randomBytes(4).toString('hex').toUpperCase()
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

function generateSlugs(n: number, prefix: string, used: Set<string>): string[] {
  const slugs: string[] = []
  while (slugs.length < n) {
    const s = randomSlug(prefix)
    if (!used.has(s) && !slugs.includes(s)) slugs.push(s)
  }
  return slugs
}

export async function generatePrint(config: PrintConfig) {
  const { prefix, destination, count, regen } = config

  fs.mkdirSync(QR_DIR, { recursive: true })

  const redirects = readRedirects()
  const used = usedSlugs(redirects)

  const newSlugs = generateSlugs(count, prefix, used)
  if (newSlugs.length > 0) {
    const newLines = newSlugs.map((slug) =>
      JSON.stringify({ source: `/redirect/${slug}`, destination, permanent: false })
    )
    fs.appendFileSync(REDIRECTS_PATH, '\n' + newLines.join('\n') + '\n')
    console.log(`Recorded ${newSlugs.length} new ${prefix}* slugs in redirects.jsonl`)
  }

  const toRender: string[] = [...newSlugs]

  if (regen) {
    const existingSlugs = redirects
      .filter((r) => r.source.includes(`/${prefix}`))
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
  console.log(`\n✓ ${generated} generated · ${prefix}* → ${destination}`)
}
