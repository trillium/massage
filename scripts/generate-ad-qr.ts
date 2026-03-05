import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { QRColorPreset } from '../lib/qr/colors'
import { colorPresets } from '../lib/qr/colors'
import { buildQROptions } from '../lib/qr/config'
import { JSDOM } from 'jsdom'
import nodeCanvas from 'canvas'
import QRCodeStyling from 'qr-code-styling'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUTPUT_DIR = path.join(__dirname, '../generated/qrcodes/ad')

const DEFAULT_SIZE = 2000
const DEFAULT_PRESET: QRColorPreset = 'light'

function slugify(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase()
}

function parseArgs(args: string[]) {
  const flags: Record<string, string> = {}
  const positional: string[] = []

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      flags[key] = args[i + 1] ?? ''
      i++
    } else {
      positional.push(args[i])
    }
  }

  return { flags, positional }
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2))

  if (positional.length < 1 || flags.help !== undefined) {
    const presetNames = Object.keys(colorPresets).join(', ')
    console.log(`
Usage: pnpm tsx scripts/generate-ad-qr.ts <url> [url2 ...] [options]

Generates print-ready QR code PNGs for the full-page ad green box.
Each URL gets its own QR code file.

Arguments:
  url          One or more URLs to encode

Options:
  --size N     QR code size in pixels (default: ${DEFAULT_SIZE})
  --width N    Width in pixels (overrides --size)
  --height N   Height in pixels (overrides --size)
  --preset P   Color preset: ${presetNames} (default: ${DEFAULT_PRESET})
  --outdir D   Output directory (default: generated/qrcodes/ad)
  --help       Show this help

Examples:
  pnpm tsx scripts/generate-ad-qr.ts https://trilliummassage.la/book
  pnpm tsx scripts/generate-ad-qr.ts https://trilliummassage.la/book --size 1500
  pnpm tsx scripts/generate-ad-qr.ts url1 url2 url3 --preset dark
`)
    process.exit(positional.length < 1 ? 1 : 0)
  }

  const size = Number(flags.size) || DEFAULT_SIZE
  const width = Number(flags.width) || size
  const height = Number(flags.height) || size
  const preset = (flags.preset as QRColorPreset) || DEFAULT_PRESET
  const outdir = flags.outdir || OUTPUT_DIR

  if (!(preset in colorPresets)) {
    console.error(`Unknown preset: ${preset}`)
    console.error(`Available: ${Object.keys(colorPresets).join(', ')}`)
    process.exit(1)
  }

  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true })
  }

  for (const url of positional) {
    const slug = slugify(url)
    const filename = `${slug}.png`
    const filepath = path.join(outdir, filename)

    const options = buildQROptions(url, preset, {
      width,
      height,
      type: 'canvas',
    })

    const qr = new QRCodeStyling({ jsdom: JSDOM, nodeCanvas, ...options })
    const buffer = await qr.getRawData('png')

    if (!buffer) {
      console.error(`Failed to generate QR for: ${url}`)
      process.exit(1)
    }

    const data = Buffer.isBuffer(buffer) ? buffer : Buffer.from(await buffer.arrayBuffer())
    fs.writeFileSync(filepath, data)

    console.log(`${url} → ${filepath} (${width}x${height}px)`)
  }
}

main()
