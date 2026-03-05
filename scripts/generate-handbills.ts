/**
 * generate-handbills.ts
 *
 * Generates 17 unique handbill QR codes for print.
 * Each slug is handbill_XXXXXX (6-char base36 random, no conflicts with existing).
 *
 * - Appends new redirects to redirects.jsonl
 * - Saves QR SVGs to print/qr/
 * - Writes print/index.html with all 17 codes in a grid
 *
 * Usage: pnpm tsx scripts/generate-handbills.ts
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const REDIRECTS_PATH = path.join(REPO_ROOT, 'redirects.jsonl')
const TEMPLATE_PATH = path.join(REPO_ROOT, 'lib/qr/eyelet-template.svg')
const PRINT_DIR = path.join(REPO_ROOT, 'print')
const QR_DIR = path.join(PRINT_DIR, 'qr')

const DESTINATION = 'https://trilliummassage.la/blog/airbnb-host-promo-2026-03'
const BASE_URL = 'https://trilliummassage.la/redirect'
const COUNT = 17

const QR_MONKEY_API = 'https://api.qrcode-monkey.com/qr/custom'
const STEP = 19
const COLOR_TEAL = 'rgb(45, 212, 191)'
const TEAL_STYLE = `style="fill: ${COLOR_TEAL}; stroke: ${COLOR_TEAL}; stroke-width: 1;" vector-effect="non-scaling-stroke"`

const SHAPES: Record<string, string> = {
  '0000': `<g>\n\t<path d="M100,65.625c0,9.507-3.355,17.611-10.059,24.316C83.236,96.645,75.132,100,65.625,100h-31.25\n\t\tc-9.504,0-17.61-3.355-24.315-10.059C3.354,83.236,0,75.132,0,65.625v-31.25c0-9.504,3.353-17.61,10.059-24.315\n\t\tC16.766,3.354,24.871,0,34.375,0h31.25c9.508,0,17.613,3.353,24.316,10.059C96.646,16.766,100,24.871,100,34.375V65.625z"/>\n</g>`,
  '0001': `<g>\n\t<path d="M65.625,0H0v100h65.625c9.505,0,17.611-3.354,24.316-10.059C96.646,83.236,100,75.13,100,65.625v-31.25\n\t\tc0-9.505-3.354-17.611-10.059-24.316C83.236,3.354,75.13,0,65.625,0z"/>\n</g>`,
  '0010': `<g>\n\t<path d="M100,34.375c0-9.505-3.354-17.611-10.059-24.316C83.236,3.354,75.13,0,65.625,0h-31.25\n\t\tC24.87,0,16.764,3.353,10.059,10.059S0,24.87,0,34.375v31.25c0,0.521,0.065,1.303,0.195,2.344H0V100h100V67.969h-0.195c0.132-1.041,0.195-1.822,0.195-2.344V34.375z"/>\n</g>`,
  '0011': `<g>\n\t<path d="M65.625,0H0V100H100V34.375c0,-9.505,-3.353,-17.611,-10.059,-24.316\n\t\tC83.235,3.354,75.13,0,65.625,0z"/></g>`,
  '0100': `<g>\n\t<path d="M100,34.375V0H34.375C24.87,0,16.764,3.353,10.059,10.059S0,24.87,0,34.375v31.25c0,9.505,3.353,17.611,10.059,24.316\n\t\tC16.765,96.646,24.87,100,34.375,100H100V34.375z"/>\n</g>`,
  '0101': `<rect width="100" height="100"/>`,
  '0110': `<g>\n\t<path d="M100,34.375V0H34.375C24.87,0,16.764,3.353,10.059,10.059S0,24.87,0,34.375V100h100V34.375z"/>\n</g>`,
  '0111': `<rect width="100" height="100"/>`,
  '1000': `<g>\n\t<path d="M99.805,32.031H100V0H0v32.031h0.195C0.065,33.073,0,33.854,0,34.375v31.25c0,9.505,3.353,17.611,10.059,24.316\n\t\tC16.765,96.646,24.87,100,34.375,100h31.25c9.505,0,17.611-3.354,24.316-10.059C96.646,83.236,100,75.13,100,65.625v-31.25\n\t\tC100,33.854,99.937,33.073,99.805,32.031z"/>\n</g>`,
  '1001': `<g>\n\t<path d="M100,0H0v100h65.625c9.505,0,17.611-3.354,24.316-10.059C96.646,83.236,100,75.13,100,65.625V0z"/>\n</g>`,
  '1010': `<rect width="100" height="100"/>`,
  '1011': `<rect width="100" height="100"/>`,
  '1100': `<g>\n\t<path d="M100,0H0v65.625c0,9.505,3.353,17.611,10.059,24.316C16.765,96.646,24.87,100,34.375,100H100V0z"/>\n</g>`,
  '1101': `<rect width="100" height="100"/>`,
  '1110': `<rect width="100" height="100"/>`,
  '1111': `<rect width="100" height="100"/>`,
}

function randomSlug(): string {
  return 'handbill_' + crypto.randomBytes(4).toString('hex')
}

function existingSlugs(): Set<string> {
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

function generateSlugs(n: number, existing: Set<string>): string[] {
  const slugs: string[] = []
  while (slugs.length < n) {
    const s = randomSlug()
    if (!existing.has(s) && !slugs.includes(s)) slugs.push(s)
  }
  return slugs
}

async function fetchQRMonkeySvg(url: string): Promise<string> {
  const res = await fetch(QR_MONKEY_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: url,
      config: {
        body: 'round',
        eye: 'frame2',
        eyeBall: 'ball2',
        erf1: ['fv'],
        erf2: [],
        erf3: [],
        brf1: ['fv'],
        brf2: [],
        brf3: [],
        bodyColor: '#2dd4bf',
        bgColor: '#1f1f1f',
        eye1Color: '#2dd4bf',
        eye2Color: '#2dd4bf',
        eye3Color: '#2dd4bf',
        eyeBall1Color: '#ffbd4a',
        eyeBall2Color: '#ffbd4a',
        eyeBall3Color: '#ffbd4a',
        gradientColor1: '',
        gradientColor2: '',
        gradientType: 'linear',
        gradientOnEyes: false,
        logo: '',
        logoMode: 'default',
      },
      size: 600,
      download: 'imageUrl',
      file: 'svg',
    }),
  })
  const json = (await res.json()) as { imageUrl?: string }
  if (!json.imageUrl) throw new Error(`QR Monkey error: ${JSON.stringify(json)}`)
  const svgRes = await fetch(`https:${json.imageUrl}`)
  return svgRes.text()
}

function parseModules(svg: string): Set<string> {
  const margin = parseInt(svg.match(/translate\((\d+),\d+\)/)![1])
  const innerStart =
    svg.indexOf(`<g transform="translate(${margin},${margin})">`) +
    `<g transform="translate(${margin},${margin})">`.length
  const inner = svg.slice(innerStart)
  const on = new Set<string>()
  const re = /<g transform="translate\((\d+),(\d+)\) scale\(0\.19,0\.19\)">/g
  for (const m of inner.matchAll(re)) {
    on.add(`${Math.round(parseInt(m[1]) / STEP)},${Math.round(parseInt(m[2]) / STEP)}`)
  }
  return on
}

function renderDots(on: Set<string>): string {
  const parts: string[] = []
  for (const key of on) {
    const [col, row] = key.split(',').map(Number)
    const T = on.has(`${col},${row - 1}`) ? 1 : 0
    const R = on.has(`${col + 1},${row}`) ? 1 : 0
    const B = on.has(`${col},${row + 1}`) ? 1 : 0
    const L = on.has(`${col - 1},${row}`) ? 1 : 0
    const shape = SHAPES[`${T}${R}${B}${L}`]
    if (!shape) throw new Error(`Unknown mask: ${T}${R}${B}${L}`)
    parts.push(
      `<g transform="translate(${col * STEP},${row * STEP}) scale(0.19,0.19)"><g transform="" ${TEAL_STYLE}>\n${shape}\n</g></g>`
    )
  }
  return parts.join('\n')
}

async function generateQR(url: string): Promise<string> {
  const apiSvg = await fetchQRMonkeySvg(url)
  const on = parseModules(apiSvg)
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
  const dots = renderDots(on)
  return template.replace('<!-- DATA_DOTS_PLACEHOLDER -->', dots)
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`Template not found: ${TEMPLATE_PATH}`)
    process.exit(1)
  }
  fs.mkdirSync(QR_DIR, { recursive: true })

  const existing = existingSlugs()
  const slugs = generateSlugs(COUNT, existing)

  // Append to redirects.jsonl
  const newRedirects = slugs.map((slug) =>
    JSON.stringify({ source: `/redirect/${slug}`, destination: DESTINATION, permanent: false })
  )
  fs.appendFileSync(REDIRECTS_PATH, '\n' + newRedirects.join('\n') + '\n')
  console.log(`Added ${slugs.length} redirects to redirects.jsonl`)

  // Generate QR codes concurrently (batches of 4 to avoid rate limits)
  const results: Array<{ slug: string; file: string }> = []
  for (let i = 0; i < slugs.length; i += 4) {
    const batch = slugs.slice(i, i + 4)
    await Promise.all(
      batch.map(async (slug) => {
        const url = `${BASE_URL}/${slug}`
        console.log(`  [${results.length + 1}/${COUNT}] Generating ${slug}…`)
        const svg = await generateQR(url)
        const file = path.join(QR_DIR, `${slug}.svg`)
        fs.writeFileSync(file, svg)
        results.push({ slug, file })
        console.log(`  ✓ ${slug}`)
      })
    )
  }

  // Write index HTML
  const cards = results
    .map(
      ({ slug }) => `
  <div class="card">
    <img src="qr/${slug}.svg" alt="${slug}">
    <div class="slug">${slug}</div>
    <div class="url">${BASE_URL}/${slug}</div>
  </div>`
    )
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Handbill QR Codes — Airbnb Promo 2026-03</title>
<style>
  body { font-family: monospace; background: #1a1a1a; color: #eee; margin: 0; padding: 24px; }
  h1 { color: #ffbd4a; margin-bottom: 4px; }
  p { color: #666; font-size: 12px; margin: 0 0 24px; }
  .grid { display: flex; flex-wrap: wrap; gap: 20px; }
  .card { background: #222; border-radius: 6px; padding: 12px; width: 180px; }
  .card img { width: 100%; display: block; border-radius: 4px; }
  .slug { color: #2dd4bf; font-size: 11px; margin-top: 8px; word-break: break-all; }
  .url { color: #444; font-size: 10px; margin-top: 2px; word-break: break-all; }
</style>
</head>
<body>
<h1>Handbill QR Codes</h1>
<p>→ ${DESTINATION}<br>${COUNT} unique codes · generated ${new Date().toISOString().slice(0, 10)}</p>
<div class="grid">
${cards}
</div>
</body>
</html>`

  const indexPath = path.join(PRINT_DIR, 'index.html')
  fs.writeFileSync(indexPath, html)
  console.log(`\nDone. ${results.length} QR codes saved to print/qr/`)
  console.log(`Index: ${indexPath}`)
}

main()
