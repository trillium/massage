import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { encodeRef } from '../../lib/ref/refCodec.ts'
import { generateNativeQRSvg } from '../../lib/qr/generate-native.ts'
import { colorPresets } from '../../lib/qr/colors.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const [tag] = process.argv.slice(2)
const secret = process.env.NEXT_PUBLIC_REF_CODE_SECRET

if (!tag || !/^af-\d+$/.test(tag) || !secret) {
  console.error('Usage: NEXT_PUBLIC_REF_CODE_SECRET=... pnpm tsx print/concept-pack/make-qr.mts af-<n>')
  process.exit(1)
}

const url = `https://trilliummassage.la/go/${encodeRef(tag, secret)}`
const svg = await generateNativeQRSvg(url, colorPresets.light)
fs.writeFileSync(path.join(HERE, 'assets', `qr-${tag}.svg`), svg)
console.log(url)
