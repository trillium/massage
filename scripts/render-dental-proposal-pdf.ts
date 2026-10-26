#!/usr/bin/env tsx

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const BASE_URL = process.env.PROPOSAL_BASE_URL ?? 'http://localhost:9876'
const PROPOSAL_URL = `${BASE_URL}/dental-exchange/proposal?token=dental-exchange-2026`
const OUTPUT_DIR = path.join(root, 'proposals', 'dental-exchange-2026', 'output')
const PDF_PATH = path.join(OUTPUT_DIR, 'proposal.pdf')

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  await page.goto(PROPOSAL_URL, { waitUntil: 'networkidle0' })
  await page.addStyleTag({
    content: ':is(header, footer, nav):not([data-proposal] *) { display: none !important }',
  })
  await page.pdf({
    path: PDF_PATH,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  })
  await browser.close()
  console.log(`PDF → ${path.relative(root, PDF_PATH)}`)

  if (process.env.PROPOSAL_NO_OPEN) return
  const opener =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
  spawn(opener, [PDF_PATH], { detached: true, stdio: 'ignore' }).unref()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
