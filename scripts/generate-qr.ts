import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { QRColorPreset } from '../lib/qr/colors'
import { colorPresets } from '../lib/qr/colors'
import { generateQRBuffer } from '../lib/qr/generate'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUTPUT_DIR = path.join(__dirname, '../public/qr')

function deriveFilename(url: string): string {
  const parsed = new URL(url)
  const segments = parsed.pathname.split('/').filter(Boolean)
  if (segments.length > 0) {
    return segments[segments.length - 1]
  }
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 8)
  return `qr_${hash}`
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    const presetNames = Object.keys(colorPresets).join(', ')
    console.log(`
Usage: pnpm tsx scripts/generate-qr.ts <url> [preset]

Arguments:
  url       URL to encode
  preset    Color preset: ${presetNames} (default: default)

Output: public/qr/{name}.svg (name derived from URL path)

Examples:
  pnpm tsx scripts/generate-qr.ts https://trilliummassage.la/redirect/handbill_a3f2b1
  pnpm tsx scripts/generate-qr.ts https://trilliummassage.la/redirect/handbill_c9d4e2 light
`)
    process.exit(1)
  }

  const url = args[0]
  const preset = (args[1] as QRColorPreset) || 'default'

  if (!(preset in colorPresets)) {
    console.error(`Unknown preset: ${preset}`)
    console.error(`Available: ${Object.keys(colorPresets).join(', ')}`)
    process.exit(1)
  }

  const baseName = deriveFilename(url)
  const filename = `${baseName}.svg`

  console.log(`Generating QR: ${url}`)
  console.log(`Preset: ${preset} → ${filename}`)

  const buffer = await generateQRBuffer(url, preset, 'svg')

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const filepath = path.join(OUTPUT_DIR, filename)
  fs.writeFileSync(filepath, buffer)

  console.log(`Saved: ${filepath}`)
}

main()
