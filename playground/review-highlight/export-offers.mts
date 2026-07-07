import puppeteer from 'puppeteer'
import path from 'node:path'
import fs from 'node:fs'

const dir = path.dirname(new URL(import.meta.url).pathname)

const evergreen = process.argv.includes('--evergreen')
const outDir = evergreen
  ? path.join(dir, 'output', 'evergreen', 'offer-frames')
  : path.join(dir, 'output', 'offer-frames')
fs.mkdirSync(outDir, { recursive: true })
const names: Record<string, string> = evergreen
  ? { e1: 'proof', e2: 'howto', e3: 'shortnotice', e4: 'events', e5: 'gift' }
  : { 1: 'offer', 2: 'howto', 3: 'deadline', 4: 'matchday', 5: 'squad' }
const variants = evergreen ? ['e1', 'e2', 'e3', 'e4', 'e5'] : ['1', '2', '3', '4', '5']

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 })
for (const [idx, v] of variants.entries()) {
  await page.goto(`http://localhost:8899/offer?v=${v}`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(`document.title === 'ready-${v}'`)
  const frame = await page.$('#frame')
  if (!frame) throw new Error('#frame not found')
  const file = `0${idx + 1}-${names[v]}.png`
  await frame.screenshot({ path: path.join(outDir, file) })
  console.log(file)
}
await browser.close()
console.log(outDir)
