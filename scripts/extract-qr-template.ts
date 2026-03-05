/**
 * extract-qr-template.ts
 *
 * Extracts the eyelet template from a QR Monkey SVG:
 *   - 3 finder outer rings  (scale 1.33, teal)
 *   - 3 finder eyeballs     (scale 0.57, golden)
 *
 * Produces a template SVG with exact eyelet positions, no data dots.
 * Data dots are injected separately.
 *
 * Usage: pnpm tsx scripts/extract-qr-template.ts <input.svg> <output-template.svg>
 */
import fs from 'node:fs'

const [, , inputPath, outputPath] = process.argv
if (!inputPath || !outputPath) {
  console.error('Usage: pnpm tsx scripts/extract-qr-template.ts <input.svg> <output.svg>')
  process.exit(1)
}

const svg = fs.readFileSync(inputPath, 'utf-8')

// Extract SVG root attributes
const svgOpen = svg.match(/<svg[^>]*>/)![0]
const background = svg.match(/<rect[^/]*\/>/)![0]
const outerTranslate = svg.match(/translate\((\d+),(\d+)\)/)!
const margin = outerTranslate[1] // e.g. "38"

// Extract the inner content (inside outer translate group)
const innerStart =
  svg.indexOf(`<g transform="translate(${margin},${margin})">`) +
  `<g transform="translate(${margin},${margin})">`.length
const innerEnd = svg.lastIndexOf('</svg>') - 4 // strip closing </g></svg>
const inner = svg.slice(innerStart, innerEnd)

// Extract finder outer rings: scale(1.33)
const ringPattern = /(<g transform="translate\(\d+,\d+\) scale\(1\.33[^"]*\)">[\s\S]*?<\/g><\/g>)/g
const rings = [...inner.matchAll(ringPattern)].map((m) => m[1])

// Extract eyeballs: scale(0.57)
const eyePattern = /(<g transform="translate\(\d+,\d+\) scale\(0\.57[^"]*\)">[\s\S]*?<\/g><\/g>)/g
const eyeballs = [...inner.matchAll(eyePattern)].map((m) => m[1])

console.log(`Found ${rings.length} finder rings, ${eyeballs.length} eyeballs`)

if (rings.length !== 3 || eyeballs.length !== 3) {
  console.error('Expected exactly 3 rings and 3 eyeballs — check input SVG')
  process.exit(1)
}

// Fix winding order: ring paths are compound (outer + inner subpath).
// A scale(1,-1) Y-flip inside ring 1 inverts winding → fill-rule:nonzero
// fills solid instead of frame. Force evenodd so the donut renders correctly
// regardless of winding direction.
const fixedRings = rings.map((r) =>
  r.replace(/<path(\s(?![^>]*fill-rule)[^>]*d="[^"]*z[^"]*M[^"]*")/g, '<path fill-rule="evenodd"$1')
)

const template = `<?xml version="1.0" encoding="utf-8"?>
<!-- QR Eyelet Template — eyelets only, no data dots -->
<!-- Data dots go inside: <g transform="translate(${margin},${margin})"> ... </g> -->
${svgOpen}
${background}
<g transform="translate(${margin},${margin})">
${fixedRings.join('\n')}
${eyeballs.join('\n')}
<!-- DATA_DOTS_PLACEHOLDER -->
</g>
</svg>`

fs.writeFileSync(outputPath, template)
console.log(`Template written to ${outputPath}`)
console.log(`Eyelets: 3 outer rings (scale 1.33, teal) + 3 eyeballs (scale 0.57, golden)`)
console.log(`Replace <!-- DATA_DOTS_PLACEHOLDER --> with generated dot content`)
