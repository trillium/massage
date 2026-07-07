import puppeteer from 'puppeteer'
import path from 'node:path'

import fs from 'node:fs'

const dir = path.dirname(new URL(import.meta.url).pathname)
fs.mkdirSync(path.join(dir, 'output'), { recursive: true })

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1100, deviceScaleFactor: 1 })
await page.goto('http://localhost:8899/content/grid-preview', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))
const frame = await page.$('#frame')
await frame!.screenshot({ path: path.join(dir, 'output', 'grid-preview.png') })
await browser.close()
console.log('ok')
