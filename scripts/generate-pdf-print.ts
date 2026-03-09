import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateNativeQRSvg } from '../lib/qr/generate-native'
import { SCOPE_DEFAULTS } from '../lib/qr/scope-defaults'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const QR_DIR = path.join(REPO_ROOT, 'print', 'qr')
const BASE_URL = 'https://trilliummassage.la/rd'

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
  if (!/^[A-Z]+\d+-$/.test(prefix)) {
    console.warn(`⚠ Prefix "${prefix}" doesn't match recommended format {ALPHA}{NUM}- (e.g. BC01-)`)
  }

  const scope = prefix.replace(/-$/, '')
  const registered = SCOPE_DEFAULTS[scope]
  if (!registered) {
    console.warn(
      `⚠ Scope "${scope}" not registered in lib/qr/scope-defaults.ts — QR codes won't redirect until added`
    )
  }

  const destination = arg('dest', defaults.destination).replace(
    /^\//,
    'https://trilliummassage.la/'
  )
  if (registered && destination !== registered) {
    console.warn(
      `⚠ --dest=${destination} differs from scope default (${registered}). Scope default wins at redirect time.`
    )
  }

  return {
    prefix,
    destination,
    count: parseInt(arg('count', String(defaults.count)), 10),
    regen: process.argv.includes('--regen'),
  }
}

function scopeSlug(prefix: string): string {
  const scope = prefix.replace(/-$/, '')
  const hash = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${scope}_${hash}`
}

function existingSlugs(): Set<string> {
  if (!fs.existsSync(QR_DIR)) return new Set()
  return new Set(
    fs
      .readdirSync(QR_DIR)
      .filter((f) => f.endsWith('.svg'))
      .map((f) => f.replace('.svg', ''))
  )
}

function generateSlugs(n: number, prefix: string, used: Set<string>): string[] {
  const slugs: string[] = []
  while (slugs.length < n) {
    const s = scopeSlug(prefix)
    if (!used.has(s) && !slugs.includes(s)) slugs.push(s)
  }
  return slugs
}

export async function generatePrint(config: PrintConfig) {
  const { prefix, count, regen } = config
  const scope = prefix.replace(/-$/, '')

  fs.mkdirSync(QR_DIR, { recursive: true })

  const used = existingSlugs()
  const newSlugs = generateSlugs(count, prefix, used)

  console.log(
    `Generated ${newSlugs.length} new ${scope}_* slugs (no redirects.jsonl — using catch-all /rd/ route)`
  )

  const toRender: string[] = [...newSlugs]

  if (regen) {
    const existing = [...used].filter((s) => s.startsWith(`${scope}_`))
    const missing = existing.filter((s) => !fs.existsSync(path.join(QR_DIR, `${s}.svg`)))
    toRender.push(...missing.filter((s) => !toRender.includes(s)))
    if (missing.length) console.log(`Regenerating ${missing.length} missing SVGs`)
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
  console.log(`\n✓ ${generated} generated · ${scope}_* → ${BASE_URL}/${scope}_…`)
}
