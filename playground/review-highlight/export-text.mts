import puppeteer from 'puppeteer'
import path from 'node:path'
import fs from 'node:fs'

const dir = path.dirname(new URL(import.meta.url).pathname)
const evergreen = process.argv.includes('--evergreen')
const args = process.argv.slice(2).filter((a) => a !== '--evergreen')
const texts = JSON.parse(fs.readFileSync(path.join(dir, 'content', 'texts.json'), 'utf8'))
const key = args[0] ?? Object.keys(texts)[0]
const outDir = evergreen
  ? path.join(dir, 'output', 'evergreen', 'special')
  : path.join(dir, 'output', 'special')
fs.mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 })
await page.goto(`http://localhost:8899/text?t=${key}${evergreen ? '&promo=0' : ''}`, { waitUntil: 'networkidle0' })
await page.waitForFunction(`document.title === 'ready-text'`)
const frame = await page.$('#frame')
if (!frame) throw new Error('#frame not found')
await frame.screenshot({ path: path.join(outDir, `txt-${key}.png`) })
await browser.close()
console.log(`txt-${key}.png`)
