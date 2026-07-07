import puppeteer from 'puppeteer'
import path from 'node:path'

import fs from 'node:fs'

const dir = path.dirname(new URL(import.meta.url).pathname)
fs.mkdirSync(path.join(dir, 'output'), { recursive: true })

const base = process.argv[2] ?? 'http://localhost:8899/content/variants'
const variants = (process.argv[3] ?? '1,2,3,4,5').split(',')

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 })

for (const v of variants) {
  const out = path.join(dir, 'output', `review-highlight-v${v}.png`)
  await page.goto(`${base}?v=${v}`, { waitUntil: 'networkidle0' })
  const frame = await page.$('#frame')
  if (!frame) throw new Error('#frame not found')
  await frame.screenshot({ path: out })
  console.log(out)
}
await browser.close()
