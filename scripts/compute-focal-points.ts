import sharp from 'sharp'
import { readdirSync } from 'fs'
import { resolve } from 'path'

const GALLERY_DIR = resolve(import.meta.dir, '../public/static/images/gallery')

const images = readdirSync(GALLERY_DIR)
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  .sort()

console.log(`Computing focal points for ${images.length} images...\n`)

const results: Array<{ file: string; position: string }> = []

for (const img of images) {
  const fullPath = resolve(GALLERY_DIR, img)
  const meta = await sharp(fullPath).metadata()

  // Resize with attention strategy — Sharp exposes attentionX/Y in the output info
  const { info } = await sharp(fullPath)
    .resize(400, 300, { fit: 'cover', position: 'attention' })
    .toBuffer({ resolveWithObject: true })

  const x = Math.round(((info as any).attentionX / (meta.width ?? 1)) * 100)
  const y = Math.round(((info as any).attentionY / (meta.height ?? 1)) * 100)
  const position = `${x}% ${y}%`

  results.push({ file: img, position })
  console.log(`  ${img.padEnd(52)} ${position}`)
}

console.log('\n// Paste into app/gallery/page.tsx (omit lines that are "50% 50%"):\n')
for (const { file, position } of results) {
  const key = `/static/images/gallery/${file}`
  console.log(`  { src: '${key}', objectPosition: '${position}' },`)
}
