/**
 * test-adjacency.ts
 *
 * Generates two visual tests for the QR adjacency shape logic:
 *   1. Reference card: all 16 TRBL masks rendered as labeled tiles
 *   2. Grid test: the specific 4×4 ON/OFF pattern from user request
 *
 * Usage: pnpm tsx scripts/test-adjacency.ts [output-dir]
 * Output: adjacency-reference.svg, adjacency-grid.svg
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const OUT_DIR = process.argv[2] ?? path.join(REPO_ROOT, 'public/qr/test')

const COLOR_TEAL = 'rgb(45, 212, 191)'
// Larger scale for visibility: 0.5 → 50px modules (vs 19px in production)
const SCALE = 0.5
const MODULE_PX = 100 * SCALE

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

function renderModule(col: number, row: number, mask: string): string {
  const shape = SHAPES[mask]
  if (!shape) throw new Error(`Unknown mask: ${mask}`)
  const x = col * MODULE_PX
  const y = row * MODULE_PX
  return `<g transform="translate(${x},${y}) scale(${SCALE},${SCALE})">
  <g style="fill:${COLOR_TEAL};stroke:${COLOR_TEAL};stroke-width:1;" vector-effect="non-scaling-stroke">
${shape}
  </g>
</g>`
}

// ─── Test 1: Individual mask SVGs ────────────────────────────────────────────
const MASK_SCALE = 1.5 // larger scale for individual tiles = 150px per module
const MASK_PX = 100 * MASK_SCALE
const MASK_PAD = 16
const MASK_LABEL_H = 20

function renderMaskSvg(mask: string): string {
  const W = MASK_PX + MASK_PAD * 2
  const H = MASK_PX + MASK_PAD * 2 + MASK_LABEL_H
  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#1a1a1a" rx="4"/>
  <rect x="${MASK_PAD}" y="${MASK_LABEL_H + MASK_PAD}" width="${MASK_PX}" height="${MASK_PX}" fill="#222" rx="3"/>
  <g transform="translate(${MASK_PAD},${MASK_LABEL_H + MASK_PAD}) scale(${MASK_SCALE},${MASK_SCALE})">
    <g style="fill:${COLOR_TEAL};stroke:${COLOR_TEAL};stroke-width:1;" vector-effect="non-scaling-stroke">
${SHAPES[mask]}
    </g>
  </g>
  <text x="${W / 2}" y="${MASK_LABEL_H + MASK_PAD + MASK_PX / 2 + 5}" text-anchor="middle" font-family="monospace" font-size="14" fill="rgba(0,0,0,0.45)">${mask}</text>
  <text x="${W / 2}" y="${MASK_LABEL_H - 4}" text-anchor="middle" font-family="monospace" font-size="12" fill="#888">${mask}</text>
</svg>`
}

// ─── Test 2: Grid test — specific 4×4 ON/OFF pattern ────────────────────────
//
//   0 0 0 0
//   0 1 1 1
//   0 1 0 0
//   0 0 0 0
//
function renderGridTest(): string {
  // Grid: row 0-3, col 0-3. 1 = ON module.
  const grid = [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ]

  const ROWS = grid.length
  const COLS = grid[0].length

  const on = new Set<string>()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) on.add(`${c},${r}`)
    }
  }

  const PAD = 20
  const W = COLS * MODULE_PX + PAD * 2
  const H = ROWS * MODULE_PX + PAD * 2 + 30 // 30 for title

  const modules: string[] = []
  const labels: string[] = []

  for (const key of on) {
    const [col, row] = key.split(',').map(Number)
    const T = on.has(`${col},${row - 1}`) ? 1 : 0
    const R = on.has(`${col + 1},${row}`) ? 1 : 0
    const B = on.has(`${col},${row + 1}`) ? 1 : 0
    const L = on.has(`${col - 1},${row}`) ? 1 : 0
    const mask = `${T}${R}${B}${L}`
    const x = PAD + col * MODULE_PX
    const y = 30 + PAD + row * MODULE_PX

    modules.push(`<g transform="translate(${x},${y}) scale(${SCALE},${SCALE})">
  <g style="fill:${COLOR_TEAL};stroke:${COLOR_TEAL};stroke-width:1;" vector-effect="non-scaling-stroke">
${SHAPES[mask]}
  </g>
</g>`)
    labels.push(
      `<text x="${x + MODULE_PX / 2}" y="${y + MODULE_PX / 2 + 4}" text-anchor="middle" font-family="monospace" font-size="8" fill="rgba(0,0,0,0.5)">${mask}</text>`
    )
  }

  // Grid lines for reference
  const gridLines: string[] = []
  for (let r = 0; r <= ROWS; r++) {
    gridLines.push(
      `<line x1="${PAD}" y1="${30 + PAD + r * MODULE_PX}" x2="${PAD + COLS * MODULE_PX}" y2="${30 + PAD + r * MODULE_PX}" stroke="#333" stroke-width="0.5"/>`
    )
  }
  for (let c = 0; c <= COLS; c++) {
    gridLines.push(
      `<line x1="${PAD + c * MODULE_PX}" y1="${30 + PAD}" x2="${PAD + c * MODULE_PX}" y2="${30 + PAD + ROWS * MODULE_PX}" stroke="#333" stroke-width="0.5"/>`
    )
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#1a1a1a"/>
  <text x="${W / 2}" y="18" text-anchor="middle" font-family="monospace" font-size="13" fill="#ffbd4a">Grid test: 0000 / 0111 / 0100 / 0000</text>
${gridLines.join('\n')}
${modules.join('\n')}
${labels.join('\n')}
</svg>`
}

// ─── Test 3: Exhaustive grid tests — one per unique shape + connection type ──
// Each test shows a minimal pattern that exercises specific corner connections.
const GRID_TESTS: Array<{ title: string; grid: number[][] }> = [
  {
    title: 'H-run (0001 · 0101 · 0100)',
    grid: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    title: 'V-run (0010 · 0101-vert · 1000)',
    grid: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  },
  {
    title: 'L top-right (0110 · 0010-end / 0100-vert)',
    grid: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    title: 'L top-left (0100-start / 0011 · 0001)',
    grid: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    title: 'L bottom-left (1000-top / 0110-corner)',
    grid: [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    title: 'L bottom-right (1001 corner)',
    grid: [
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    title: 'T-shape (1100 · 0111)',
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
  },
  {
    title: '2×2 block (all 1111)',
    grid: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  },
  {
    title: 'User L-test: 0000/0111/0100/0000',
    grid: [
      [0, 0, 0, 0],
      [0, 1, 1, 1],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
  },
]

function renderGridTestCase(title: string, grid: number[][]): string {
  const ROWS = grid.length
  const COLS = grid[0].length

  const on = new Set<string>()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) on.add(`${c},${r}`)
    }
  }

  const PAD = 16
  const TITLE_H = 24
  const W = COLS * MODULE_PX + PAD * 2
  const H = ROWS * MODULE_PX + PAD * 2 + TITLE_H

  const modules: string[] = []
  const labels: string[] = []
  const gridLines: string[] = []

  for (let r = 0; r <= ROWS; r++)
    gridLines.push(
      `<line x1="${PAD}" y1="${TITLE_H + PAD + r * MODULE_PX}" x2="${PAD + COLS * MODULE_PX}" y2="${TITLE_H + PAD + r * MODULE_PX}" stroke="#2a2a2a" stroke-width="0.5"/>`
    )
  for (let c = 0; c <= COLS; c++)
    gridLines.push(
      `<line x1="${PAD + c * MODULE_PX}" y1="${TITLE_H + PAD}" x2="${PAD + c * MODULE_PX}" y2="${TITLE_H + PAD + ROWS * MODULE_PX}" stroke="#2a2a2a" stroke-width="0.5"/>`
    )

  for (const key of on) {
    const [col, row] = key.split(',').map(Number)
    const T = on.has(`${col},${row - 1}`) ? 1 : 0
    const R = on.has(`${col + 1},${row}`) ? 1 : 0
    const B = on.has(`${col},${row + 1}`) ? 1 : 0
    const L = on.has(`${col - 1},${row}`) ? 1 : 0
    const mask = `${T}${R}${B}${L}`
    const x = PAD + col * MODULE_PX
    const y = TITLE_H + PAD + row * MODULE_PX

    modules.push(`<g transform="translate(${x},${y}) scale(${SCALE},${SCALE})">
  <g style="fill:${COLOR_TEAL};stroke:${COLOR_TEAL};stroke-width:1;" vector-effect="non-scaling-stroke">
${SHAPES[mask]}
  </g>
</g>`)
    labels.push(
      `<text x="${x + MODULE_PX / 2}" y="${y + MODULE_PX / 2 + 3}" text-anchor="middle" font-family="monospace" font-size="7" fill="rgba(0,0,0,0.6)">${mask}</text>`
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#1a1a1a" rx="4"/>
  <text x="${W / 2}" y="16" text-anchor="middle" font-family="monospace" font-size="11" fill="#888">${title}</text>
${gridLines.join('\n')}
${modules.join('\n')}
${labels.join('\n')}
</svg>`
}

// ─── Main ───────────────────────────────────────────────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const gridPath = path.join(OUT_DIR, 'adjacency-grid.svg')
fs.writeFileSync(gridPath, renderGridTest())
console.log(`Grid test:      ${gridPath}`)

// Write one SVG per mask
const maskSvgs = Object.keys(SHAPES).map((mask) => {
  const fname = `mask-${mask}.svg`
  fs.writeFileSync(path.join(OUT_DIR, fname), renderMaskSvg(mask))
  return { fname, mask }
})
console.log(`Mask tiles:     ${maskSvgs.length} files`)

// Write all grid tests to individual SVGs
const gridSvgs = GRID_TESTS.map((t, i) => {
  const fname = `grid-${String(i + 1).padStart(2, '0')}.svg`
  const svgPath = path.join(OUT_DIR, fname)
  fs.writeFileSync(svgPath, renderGridTestCase(t.title, t.grid))
  console.log(`Grid ${i + 1}:          ${svgPath}`)
  return { fname, title: t.title }
})

// Write unified HTML viewer
const htmlPath = path.join(OUT_DIR, 'index.html')
const maskRows = maskSvgs
  .map(
    ({ fname, mask }) =>
      `<div class="case"><div class="label">${mask}</div><img src="${fname}"></div>`
  )
  .join('\n')
const gridRows = gridSvgs
  .map(
    ({ fname, title }, i) =>
      `<div class="case"><div class="label">${i + 1}. ${title}</div><img src="${fname}"></div>`
  )
  .join('\n')

fs.writeFileSync(
  htmlPath,
  `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>QR Adjacency Tests</title>
<style>
  body { background: #111; color: #eee; font-family: monospace; padding: 24px; margin: 0; }
  h1 { color: #ffbd4a; margin-bottom: 4px; }
  h2 { color: #2dd4bf; font-size: 13px; margin: 28px 0 8px; border-top: 1px solid #222; padding-top: 16px; }
  .note { color: #555; font-size: 11px; margin: 0 0 12px; }
  img { display: block; border: 1px solid #2a2a2a; border-radius: 4px; }
  .grid-cases { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
  .case img { max-width: 220px; display: block; }
  .label { font-size: 11px; color: #ffbd4a; margin-bottom: 5px; user-select: all; cursor: text; }
</style>
</head>
<body>
<h1>QR Adjacency Tests</h1>
<h2>All 16 TRBL masks</h2>
<p class="note">Isolated (0000) should be fully rounded. Each single-neighbor mask: 2 rounded corners on the free side, 2 sharp on the connected side.</p>
<div class="grid-cases">
${maskRows}
</div>
<h2>Connection grid tests</h2>
<p class="note">Every junction should be seamless — no gaps, no misaligned edges.</p>
<div class="grid-cases">
${gridRows}
</div>
</body>
</html>`
)
console.log(`HTML viewer:    ${htmlPath}`)
