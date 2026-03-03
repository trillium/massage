import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { QRColorPreset } from '../lib/qr/colors'
import { colorPresets } from '../lib/qr/colors'
import { generateQRBuffer } from '../lib/qr/generate'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUTPUT_DIR = path.join(__dirname, '../generated/qrcodes')

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    const presetNames = Object.keys(colorPresets).join(', ')
    console.log(`
Usage: pnpm tsx scripts/generate-qr.ts <url> <filename> [preset] [format]

Arguments:
  url       URL to encode (e.g., https://trilliummassage.la)
  filename  Output filename (e.g., booking.svg)
  preset    Color preset: ${presetNames} (default: default)
  format    Output format: svg, png (default: svg)

Examples:
  pnpm tsx scripts/generate-qr.ts https://trilliummassage.la booking.svg
  pnpm tsx scripts/generate-qr.ts https://trilliummassage.la booking-light.svg light
  pnpm tsx scripts/generate-qr.ts https://trilliummassage.la booking.png default png
`)
    process.exit(1)
  }

  const url = args[0]
  const filename = args[1]
  const preset = (args[2] as QRColorPreset) || 'default'
  const format = (args[3] as 'svg' | 'png') || 'svg'

  if (!(preset in colorPresets)) {
    console.error(`Unknown preset: ${preset}`)
    console.error(`Available: ${Object.keys(colorPresets).join(', ')}`)
    process.exit(1)
  }

  console.log(`Generating QR code for: ${url}`)
  console.log(`Preset: ${preset}, Format: ${format}`)

  const buffer = await generateQRBuffer(url, preset, format)

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const filepath = path.join(OUTPUT_DIR, filename)
  fs.writeFileSync(filepath, buffer)

  console.log(`Saved to: ${filepath}`)
}

main()
