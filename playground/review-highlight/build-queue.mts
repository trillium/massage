import fs from 'node:fs'
import path from 'node:path'

const dir = path.dirname(new URL(import.meta.url).pathname)
const evergreen = process.argv.includes('--evergreen')
const src = evergreen
  ? path.join(dir, 'output', 'evergreen')
  : path.join(dir, 'output')
const out = path.join(dir, 'output', evergreen ? 'instagram-evergreen' : 'instagram-fifafan50')
fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })

const queue = JSON.parse(fs.readFileSync(path.join(dir, 'content', 'queue.json'), 'utf8'))
const reviews: string[] = queue.reviews
const offers: string[] = queue.offers[evergreen ? 'evergreen' : 'promo']

const display: Array<{ kind: string; file?: string }> = []
let r = 0
for (let block = 0; block < 10; block++) {
  display.push({ kind: 'PHOTO' })
  display.push({ kind: 'OFFER', file: `${offers[block % 5]}.png` })
  display.push({ kind: 'PHOTO' })
  display.push({ kind: 'REVIEW', file: `${reviews[r++]}.png` })
  display.push({ kind: 'PHOTO' })
  display.push({ kind: 'REVIEW', file: `${reviews[r++]}.png` })
}

const posting = [...display].reverse()
const lines: string[] = [
  evergreen
    ? '# EVERGREEN posting queue (no promo, no deadline) — post top to bottom, one per slot'
    : '# FIFAFAN50 posting queue — post top to bottom, one per slot',
  '# Grid result: photo|offer|photo // review|photo|review, repeating',
  '# Narrative: best of the archive first, freshest reviews land last (top of grid)',
  '',
]
let n = 0
posting.forEach((slot, i) => {
  const post = String(i + 1).padStart(2, '0')
  if (slot.kind === 'PHOTO') {
    lines.push(`post ${post}: [YOUR PHOTO]`)
    return
  }
  n++
  const isText = slot.file!.startsWith('txt-')
  const kind = slot.kind === 'OFFER' ? 'offer' : isText ? 'text' : 'review'
  const name = `${String(n).padStart(2, '0')}-${kind}-${slot.file}`
  const from = slot.kind === 'OFFER'
    ? path.join(src, 'offer-frames', slot.file!)
    : isText
      ? path.join(src, 'special', slot.file!)
      : path.join(src, 'review-frames', slot.file!)
  fs.copyFileSync(from, path.join(out, name))
  lines.push(`post ${post}: ${name}`)
})
fs.writeFileSync(path.join(out, 'POSTING-ORDER.txt'), lines.join('\n'))
console.log(`${n} frames + manifest → ${out}`)
