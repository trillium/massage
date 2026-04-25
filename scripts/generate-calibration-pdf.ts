#!/usr/bin/env tsx

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const calibDir = path.join(root, 'print', 'calibration')

const PAGES = [
  {
    html: 'single-card.html',
    pdf: 'single-card.pdf',
    width: '3.75in',
    height: '2.25in',
  },
  {
    html: 'test-sheet.html',
    pdf: 'test-sheet.pdf',
    width: '8.5in',
    height: '11in',
  },
]

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  for (const { html, pdf, width, height } of PAGES) {
    const htmlPath = path.join(calibDir, html)
    const pdfPath = path.join(calibDir, pdf)

    if (!fs.existsSync(htmlPath)) {
      console.error(`Missing: ${htmlPath}`)
      process.exit(1)
    }

    const page = await browser.newPage()
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

    await page.pdf({
      path: pdfPath,
      width,
      height,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    await page.close()
    console.log(`${pdf} → ${path.relative(root, pdfPath)}`)
  }

  await browser.close()
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
