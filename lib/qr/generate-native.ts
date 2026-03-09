import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import type { QRColorScheme } from './colors'
import { colorPresets } from './colors'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_PATH = path.join(__dirname, 'eyelet-template.svg')

const STEP = 19

// Eyelet (finder pattern) regions to exclude from data dots — template draws these
// QR finder patterns are 7x7, but need 1 module separator, so exclude 8x8
const EYELET_SIZE = 8
const FINDER_REGIONS = [
  { x: 0, y: 0 }, // top-left
  { x: 0, y: -1 }, // bottom-left (resolved at runtime)
  { x: -1, y: 0 }, // top-right (resolved at runtime)
]

function isInFinderRegion(col: number, row: number, moduleCount: number): boolean {
  for (const { x, y } of FINDER_REGIONS) {
    const fx = x === -1 ? moduleCount - EYELET_SIZE : x
    const fy = y === -1 ? moduleCount - EYELET_SIZE : y
    if (col >= fx && col < fx + EYELET_SIZE && row >= fy && row < fy + EYELET_SIZE) return true
  }
  return false
}

const SHAPES: Record<string, string> = {
  '0000': `<g>\n\t<path d="M100,65.625c0,9.507-3.355,17.611-10.059,24.316C83.236,96.645,75.132,100,65.625,100h-31.25\n\t\tc-9.504,0-17.61-3.355-24.315-10.059C3.354,83.236,0,75.132,0,65.625v-31.25c0-9.504,3.353-17.61,10.059-24.315\n\t\tC16.766,3.354,24.871,0,34.375,0h31.25c9.508,0,17.613,3.353,24.316,10.059C96.646,16.766,100,24.871,100,34.375V65.625z"/>\n</g>`,
  '0001': `<g>\n\t<path d="M65.625,0H0v100h65.625c9.505,0,17.611-3.354,24.316-10.059C96.646,83.236,100,75.13,100,65.625v-31.25\n\t\tc0-9.505-3.354-17.611-10.059-24.316C83.236,3.354,75.13,0,65.625,0z"/>\n</g>`,
  '0010': `<g>\n\t<path d="M100,34.375c0-9.505-3.354-17.611-10.059-24.316C83.236,3.354,75.13,0,65.625,0h-31.25C24.87,0,16.764,3.353,10.059,10.059\n\t\tS0,24.87,0,34.375v31.25c0,0.521,0.065,1.303,0.195,2.344H0V100h100V67.969h-0.195c0.132-1.041,0.195-1.822,0.195-2.344V34.375z"/>\n</g>`,
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

function getModules(url: string): { on: Set<string>; moduleCount: number } {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
  const { modules } = qr
  const size = modules.size
  const on = new Set<string>()

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (modules.get(col, row) && !isInFinderRegion(col, row, size)) {
        on.add(`${col},${row}`)
      }
    }
  }

  return { on, moduleCount: size }
}

function renderDots(on: Set<string>, bodyColor: string): string {
  const style = `style="fill: ${bodyColor}; stroke: ${bodyColor}; stroke-width: 1;" vector-effect="non-scaling-stroke"`
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
      `<g transform="translate(${col * STEP},${row * STEP}) scale(0.19,0.19)"><g transform="" ${style}>\n${shape}\n</g></g>`
    )
  }
  return parts.join('\n')
}

function renderEyelets(moduleCount: number, eyeFrame: string, eyeBall: string): string {
  const topRight = (moduleCount - 7) * STEP
  const bottomLeft = (moduleCount - 7) * STEP
  const frameStyle = `style="fill: ${eyeFrame}; stroke: ${eyeFrame}; stroke-width: 1;" vector-effect="non-scaling-stroke"`

  const eyeletOuter = `<g>
</g>
<g>
	<path fill="none" d="M15.02,34.145L15.004,85H66.25C76.589,85,85,76.414,85,65.86V15H33.78C23.436,15,15.02,23.586,15.02,34.145z"
		/>
	<path fill-rule="evenodd" d="M66.25,0H33.78C15.16,0,0.02,15.32,0.02,34.14L0,100h66.25C84.86,100,100,84.68,100,65.86V34.14V0H66.25z M85,65.86
		C85,76.414,76.589,85,66.25,85H15.004l0.016-50.855C15.02,23.586,23.436,15,33.78,15H85V65.86z"/>
</g>`

  const eyeletInner = `<g>
</g>
<path d="M72.744-0.021H27.23c-2.341,0-4.612,0.297-6.771,0.875C15.679,2.11,11.418,4.648,8.04,8.09
	c-0.617,0.621-1.206,1.284-1.752,1.96c-3.883,4.767-6.21,10.903-6.21,17.561L0.05,99.979h72.694
	c14.971,0,27.138-12.397,27.138-27.63V27.625v-0.014l0.168-27.617C100.05-0.006,82.107-0.021,72.744-0.021z"/>`

  return `
<g transform="translate(0,0) scale(1.33, 1.33)"><g transform=" translate(0,100) scale(1,-1) " ${frameStyle}>
${eyeletOuter}
</g></g>
<g transform="translate(${topRight},0) scale(1.33, 1.33)"><g transform="" ${frameStyle}>
${eyeletOuter}
</g></g>
<g transform="translate(0,${bottomLeft}) scale(1.33, 1.33)"><g transform="" ${frameStyle}>
${eyeletOuter}
</g></g>
<g transform="translate(38,38) scale(0.57, 0.57)"><g transform=" translate(0,100) scale(1,-1) " style="fill: ${eyeBall};">
${eyeletInner}
</g></g>
<g transform="translate(${topRight + 38},38) scale(0.57, 0.57)"><g transform="" style="fill: ${eyeBall};">
${eyeletInner}
</g></g>
<g transform="translate(38,${bottomLeft + 38}) scale(0.57, 0.57)"><g transform="" style="fill: ${eyeBall};">
${eyeletInner}
</g></g>`
}

export async function generateNativeQRSvg(
  url: string,
  colors: QRColorScheme = colorPresets.default
): Promise<string> {
  const { on, moduleCount } = getModules(url)
  const dots = renderDots(on, colors.body)
  const eyelets = renderEyelets(moduleCount, colors.eyeFrame, colors.eyeBall)

  const padding = 46
  const canvasSize = padding + moduleCount * STEP + padding
  const radius = 36

  return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
width="${canvasSize}px" height="${canvasSize}px" viewBox="0 0 ${canvasSize} ${canvasSize}" data-url="${url}">
<rect x="0" y="0" width="${canvasSize}" height="${canvasSize}" fill="${colors.containerBg}" />
<rect x="0" y="0" width="${canvasSize}" height="${canvasSize}" rx="${radius}" ry="${radius}" fill="${colors.background}" />
<g transform="translate(${padding},${padding})">
${eyelets}
${dots}
</g>
</svg>`
}
