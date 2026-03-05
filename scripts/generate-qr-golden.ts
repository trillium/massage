import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { QRColorPreset } from '../lib/qr/colors'
import { colorPresets } from '../lib/qr/colors'
import { fetchQRCode } from '../lib/qr/api'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const FIXTURES_DIR = path.join(__dirname, '../lib/qr/__tests__/fixtures')

const GOLDEN_URLS: Record<string, string> = {
  test_golden: 'https://trilliummassage.la/redirect/test_golden',
  test_abc123: 'https://trilliummassage.la/redirect/test_abc123',
  airbnb_host_promo: 'https://trilliummassage.la/redirect/airbnb_host_promo_2026-03',
  handbill_test_1: 'https://trilliummassage.la/redirect/handbill_test_1',
  handbill_test_2: 'https://trilliummassage.la/redirect/handbill_test_2',
}

async function main() {
  const presets = Object.keys(colorPresets) as QRColorPreset[]

  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true })
  }

  console.log('Generating golden fixtures from QR Monkey API\n')

  for (const [slug, url] of Object.entries(GOLDEN_URLS)) {
    console.log(`${slug}: ${url}`)
    for (const preset of presets) {
      const filename = `qr-${slug}-${preset}.svg`
      const filepath = path.join(FIXTURES_DIR, filename)

      console.log(`  ${preset}...`)
      const svg = await fetchQRCode(url, preset)
      fs.writeFileSync(filepath, svg, 'utf-8')
      console.log(`  → ${filename}`)
    }
    console.log()
  }

  console.log('Done. Golden fixtures updated.')
}

main().catch((err) => {
  console.error('Failed to generate golden fixtures:', err)
  process.exit(1)
})
