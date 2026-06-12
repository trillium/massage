import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir, homedir } from 'node:os'

const SVG_PATH = join(import.meta.dir, '../public/static/images/logo.svg')
const OUT_DIR = join(homedir(), 'Desktop')
const RED = '#dc2626'
const SIZE = 1200

const base = readFileSync(SVG_PATH, 'utf8')

function buildSvg(restColor: 'white' | 'black'): string {
  return base
    .replace(/<style>[\s\S]*?<\/style>/u, '') // content-ok: regex pattern, not UI text
    .replace('fill="#0d9488"', `fill="${RED}"`)
    .replace('<g class="rest">', `<g class="rest" fill="${restColor}">`)
}

function renderPng(svg: string, outPath: string): void {
  const tmpFile = join(tmpdir(), `logo-${Date.now()}.svg`)
  try {
    writeFileSync(tmpFile, svg, 'utf8')
    execFileSync('rsvg-convert', [
      '-w',
      String(SIZE),
      '-h',
      String(SIZE),
      '--keep-aspect-ratio',
      '-o',
      outPath,
      tmpFile,
    ])
  } finally {
    try {
      unlinkSync(tmpFile)
    } catch {
      /* ignore */
    }
  }
}

const variants: { name: string; color: 'white' | 'black' }[] = [
  { name: 'logo-white-red.png', color: 'white' },
  { name: 'logo-black-red.png', color: 'black' },
]

for (const { name, color } of variants) {
  const outPath = join(OUT_DIR, name)
  renderPng(buildSvg(color), outPath)
  console.log(`✓ ${outPath}`)
}
