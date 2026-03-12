#!/usr/bin/env tsx

/**
 * Render the CodeRabbit Miami proposal HTML → PDF, then open it.
 *
 * Runs render-proposal.ts first to ensure the HTML is fresh, then uses
 * Puppeteer to print it to PDF at letter size, and opens the result with
 * the system default PDF viewer.
 *
 * Usage: pnpm run render:proposal:pdf
 */

import { execSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const PROPOSAL_DIR = path.join(root, 'proposals', 'coderabbit-miami-2026')
const HTML_PATH = path.join(PROPOSAL_DIR, 'output', 'proposal.html')
const PDF_PATH = path.join(PROPOSAL_DIR, 'output', 'proposal.pdf')

async function main() {
  // ── 1. Re-render HTML ────────────────────────────────────────────────────
  console.log('Rendering HTML...')
  execSync('tsx scripts/render-proposal.ts', { cwd: root, stdio: 'inherit' })

  if (!fs.existsSync(HTML_PATH)) {
    console.error(`HTML not found at ${HTML_PATH}`)
    process.exit(1)
  }

  // ── 2. Print to PDF via Puppeteer ────────────────────────────────────────
  console.log('Launching browser...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  const fileUrl = `file://${HTML_PATH}`
  await page.goto(fileUrl, { waitUntil: 'networkidle0' })

  console.log('Printing to PDF...')
  await page.pdf({
    path: PDF_PATH,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  })

  await browser.close()
  console.log(`PDF → ${path.relative(root, PDF_PATH)}`)

  // ── 3. Open ──────────────────────────────────────────────────────────────
  const opener =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'

  spawn(opener, [PDF_PATH], { detached: true, stdio: 'ignore' }).unref()
  console.log('Opened.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
