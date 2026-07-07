import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'

const dir = path.dirname(new URL(import.meta.url).pathname)
const reviews = JSON.parse(fs.readFileSync(path.join(dir, 'content', 'reviews.json'), 'utf8'))
const evergreen = process.argv.includes('--evergreen')
const args = process.argv.slice(2).filter((a) => a !== '--evergreen')
const count = parseInt(args[0] ?? '30', 10)
const outDir = evergreen
  ? path.join(dir, 'output', 'evergreen', 'review-frames')
  : path.join(dir, 'output', 'review-frames')
fs.mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 })

for (let i = 0; i < Math.min(count, reviews.length); i++) {
  await page.goto(`http://localhost:8899/feed?i=${i}${evergreen ? '&promo=0' : ''}`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(`document.title === 'ready-${i}'`)
  const frame = await page.$('#frame')
  if (!frame) throw new Error('#frame not found')
  const slug = reviews[i].name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  await frame.screenshot({ path: path.join(outDir, `${String(i + 1).padStart(2, '0')}-${slug}.png`) })
  console.log(`${String(i + 1).padStart(2, '0')}-${slug}.png`)
}
await browser.close()
console.log(outDir)
