import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { colorPresets, type QRColorPreset } from '../colors'
import { generateQRSvg, generateQRBuffer } from '../generate'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const presets = Object.keys(colorPresets) as QRColorPreset[]

const GOLDEN_URLS: Record<string, string> = {
  test_golden: 'https://trilliummassage.la/redirect/test_golden',
  test_abc123: 'https://trilliummassage.la/redirect/test_abc123',
  airbnb_host_promo: 'https://trilliummassage.la/redirect/airbnb_host_promo_2026-03',
  handbill_test_1: 'https://trilliummassage.la/redirect/handbill_test_1',
  handbill_test_2: 'https://trilliummassage.la/redirect/handbill_test_2',
}

function normalizeSvg(svg: string): string {
  return svg.replace(/\r\n/g, '\n').replace(/(clip-path-[\w-]+-)\d+/g, '$1N')
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function svgContainsColor(svg: string, hex: string): boolean {
  if (svg.includes(hex)) return true
  const rgb = hexToRgb(hex)
  return (
    svg.includes(`rgb(${rgb})`) ||
    svg.includes(`rgb( ${rgb.replace(/,/g, ', ')} )`) ||
    svg.includes(`rgb(${rgb.replace(/,/g, ', ')})`) ||
    svg.includes(`rgb(${rgb.replace(/,/g, ' , ')})`)
  )
}

describe('QR local generation regression (multi-URL)', () => {
  for (const [slug, url] of Object.entries(GOLDEN_URLS)) {
    describe(`URL: ${slug}`, () => {
      it.each(presets)('preset %s produces stable normalized SVG', async (preset) => {
        const svg1 = await generateQRSvg(url, preset)
        const svg2 = await generateQRSvg(url, preset)
        expect(normalizeSvg(svg1)).toBe(normalizeSvg(svg2))
      })
    })
  }
})

describe('QR local-vs-API style matching (multi-URL)', () => {
  for (const [slug, url] of Object.entries(GOLDEN_URLS)) {
    describe(`URL: ${slug}`, () => {
      it.each(presets)('preset %s: both local and API embed correct colors', async (preset) => {
        const goldenPath = path.join(FIXTURES_DIR, `qr-${slug}-${preset}.svg`)
        if (!fs.existsSync(goldenPath)) {
          throw new Error(
            `API golden fixture missing: ${goldenPath}\nRun: pnpm tsx scripts/generate-qr-golden.ts`
          )
        }

        const apiSvg = fs.readFileSync(goldenPath, 'utf-8')
        const localSvg = await generateQRSvg(url, preset)
        const scheme = colorPresets[preset]

        expect(localSvg).toContain('<svg')
        expect(apiSvg).toContain('<svg')

        for (const color of [scheme.body, scheme.background, scheme.eyeFrame, scheme.eyeBall]) {
          expect(svgContainsColor(localSvg, color)).toBe(true)
          expect(svgContainsColor(apiSvg, color)).toBe(true)
        }
      })
    })
  }
})

describe('QR SVG structural checks', () => {
  const testUrl = GOLDEN_URLS.test_golden

  it('outputs valid SVG markup', async () => {
    const svg = await generateQRSvg(testUrl)
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  it('embeds the correct colors for each preset', async () => {
    for (const preset of presets) {
      const svg = await generateQRSvg(testUrl, preset)
      const scheme = colorPresets[preset]
      expect(svg).toContain(scheme.background)
      expect(svg).toContain(scheme.body)
    }
  })

  it('generateQRBuffer svg format returns valid SVG', async () => {
    const buffer = await generateQRBuffer(testUrl, 'default', 'svg')
    const svg = buffer.toString('utf-8')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })
})
