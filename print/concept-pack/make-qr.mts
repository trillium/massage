import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodeRef } from '../../lib/ref/refCodec.ts'
import { generateNativeQRSvg } from '../../lib/qr/generate-native.ts'
import { colorPresets } from '../../lib/qr/colors.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const HANDBILL_QR_DIR = path.join(HERE, '..', 'qr')
const TAG_PATTERN = /^af-(\d+)$/
const [first, last = first] = process.argv.slice(2)
const secret = process.env.NEXT_PUBLIC_REF_CODE_SECRET

const firstNumber = Number(TAG_PATTERN.exec(first ?? '')?.[1])
const lastNumber = Number(TAG_PATTERN.exec(last ?? '')?.[1])

if (!firstNumber || !lastNumber || lastNumber < firstNumber || !secret) {
  console.error(
    'Usage: NEXT_PUBLIC_REF_CODE_SECRET=... pnpm tsx print/concept-pack/make-qr.mts af-<n> [af-<last>]'
  )
  process.exit(1)
}

const urlFor = (tag: string) => `https://trilliummassage.la/go/${encodeRef(tag, secret)}`
const render = (url: string) => generateNativeQRSvg(url, colorPresets.light)

if (first === last) {
  const url = urlFor(first)
  fs.writeFileSync(path.join(HERE, 'assets', `qr-${first}.svg`), await render(url))
  console.log(url)
  process.exit(0)
}

fs.mkdirSync(HANDBILL_QR_DIR, { recursive: true })
const manifest = ['tag,code,url']
for (let n = firstNumber; n <= lastNumber; n++) {
  const tag = `af-${n}`
  const url = urlFor(tag)
  const fileName = `AF-${String(n).padStart(2, '0')}.svg`
  fs.writeFileSync(path.join(HANDBILL_QR_DIR, fileName), await render(url))
  manifest.push(`${tag},${url.split('/').pop()},${url}`)
}
fs.writeFileSync(path.join(HANDBILL_QR_DIR, 'af-manifest.csv'), `${manifest.join('\n')}\n`)
console.log(manifest.join('\n'))
