import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { colorPresets, type QRColorPreset } from '../colors'
import { generateQRSvg, generateQRBuffer } from '../generate'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const TEST_URL = 'https://trilliummassage.la/redirect/test_golden'

const presets = Object.keys(colorPresets) as QRColorPreset[]

function normalizeSvg(svg: string): string {
  return svg.replace(/\r\n/g, '\n').replace(/(clip-path-[a-z-]+)\d+/g, '$1N')
}

describe('QR SVG golden-file tests', () => {
  it.each(presets)('preset %s matches golden reference', async (preset) => {
    const goldenPath = path.join(FIXTURES_DIR, `qr-${preset}.svg`)
    const golden = fs.readFileSync(goldenPath, 'utf-8')
    const svg = await generateQRSvg(TEST_URL, preset)
    expect(normalizeSvg(svg)).toBe(normalizeSvg(golden))
  })
})

describe('QR SVG structural checks', () => {
  it('outputs valid SVG markup', async () => {
    const svg = await generateQRSvg(TEST_URL)
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  it('embeds the correct colors for each preset', async () => {
    for (const preset of presets) {
      const svg = await generateQRSvg(TEST_URL, preset)
      const scheme = colorPresets[preset]
      expect(svg).toContain(scheme.background)
      expect(svg).toContain(scheme.body)
    }
  })

  it('generateQRBuffer svg format returns valid SVG', async () => {
    const buffer = await generateQRBuffer(TEST_URL, 'default', 'svg')
    const svg = buffer.toString('utf-8')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })
})
