#!/usr/bin/env bun
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

type Args = { slug: string; baseUrl: string; outDir: string; waitMs: number }

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  const slug = argv.find((a) => !a.startsWith('--'))
  if (!slug) {
    console.error(
      'usage: bun scripts/snap-page.ts <slug> [--base=http://localhost:9876] [--out=public/snap] [--wait=1500]'
    )
    process.exit(2)
  }
  const baseUrl =
    argv.find((a) => a.startsWith('--base='))?.split('=')[1] ?? 'http://localhost:9876'
  const outDir = argv.find((a) => a.startsWith('--out='))?.split('=')[1] ?? 'public/snap'
  const waitMs = Number(argv.find((a) => a.startsWith('--wait='))?.split('=')[1] ?? '1500')
  return { slug, baseUrl, outDir, waitMs }
}

async function snap({ slug, baseUrl, outDir, waitMs }: Args) {
  const url = `${baseUrl}/${slug}`
  const ogPath = join(outDir, `${slug}-og.png`)
  const faviconPath = join(outDir, `${slug}-favicon.png`)
  mkdirSync(dirname(ogPath), { recursive: true })

  const browser = await chromium.launch()
  try {
    const ogContext = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    })
    const ogPage = await ogContext.newPage()
    await ogPage.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    await ogPage.waitForTimeout(waitMs)
    await ogPage.screenshot({ path: ogPath, fullPage: false })
    await ogContext.close()
    console.log(`og: ${ogPath} (1200×630)`)

    const favContext = await browser.newContext({
      viewport: { width: 1024, height: 1024 },
      deviceScaleFactor: 1,
    })
    const favPage = await favContext.newPage()
    await favPage.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    await favPage.waitForTimeout(waitMs)
    await favPage.screenshot({
      path: faviconPath,
      fullPage: false,
      clip: { x: 0, y: 0, width: 1024, height: 1024 },
    })
    await favContext.close()
    console.log(`favicon: ${faviconPath} (1024×1024 source)`)
  } finally {
    await browser.close()
  }
}

snap(parseArgs()).catch((err) => {
  console.error(err)
  process.exit(1)
})
