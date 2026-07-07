import puppeteer from 'puppeteer'
import path from 'node:path'

import fs from 'node:fs'

const dir = path.dirname(new URL(import.meta.url).pathname)
fs.mkdirSync(path.join(dir, 'output'), { recursive: true })

const url = process.argv[2] ?? 'http://localhost:8899/content/story'
const name = process.argv[3] ?? 'review-highlight-story'
const out = path.join(dir, 'output', `${name}.png`)

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle0' })
const frame = await page.$('#frame')
if (!frame) throw new Error('#frame not found')
await frame.screenshot({ path: out })
await browser.close()
console.log(out)
