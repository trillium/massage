import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import { tmpdir, homedir } from 'os'

const SVG_PATH = join(import.meta.dir, '../public/static/images/logo.svg')
const OUT_DIR = join(homedir(), 'Desktop')
const RED = '#dc2626'
const SIZE = 1200

const base = readFileSync(SVG_PATH, 'utf8')

function buildSvg(restColor: 'white' | 'black'): string {
  return base
    .replace(/<style>[\s\S]*?<\/style>/, '')
    .replace('fill="#0d9488"', `fill="${RED}"`)
    .replace('<g class="rest">', `<g class="rest" fill="${restColor}">`)
}

function renderPng(svg: string, outPath: string) {
  const tmpFile = join(tmpdir(), `logo-${Date.now()}.svg`)
  writeFileSync(tmpFile, svg, 'utf8')
  execSync(`rsvg-convert -w ${SIZE} -h ${SIZE} --keep-aspect-ratio -o "${outPath}" "${tmpFile}"`)
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
