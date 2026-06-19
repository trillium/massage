/**
 * check-overflow.ts
 *
 * Sweeps a list of routes and reports any that have horizontal overflow
 * (document.documentElement.scrollWidth > window.innerWidth).
 *
 * Uses Playwright — headless, no Interceptor required, safe in CI.
 *
 * Usage:
 *   pnpm check-overflow
 *   pnpm check-overflow --url http://localhost:3000
 *
 * Exit code 1 if any overflow is found.
 */

import { chromium } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'

const BASELINE_PATH = '.fallow/overflow-baseline.json'
type BaselineEntry = { route: string; viewport: string }
const BASELINE: BaselineEntry[] = existsSync(BASELINE_PATH)
  ? (JSON.parse(readFileSync(BASELINE_PATH, 'utf-8')) as BaselineEntry[])
  : []

function isBaselined(route: string, viewport: string): boolean {
  return BASELINE.some((b) => b.route === route && b.viewport === viewport)
}

const BASE_URL =
  process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] ?? 'http://localhost:9876'

const ROUTES = [
  '/',
  '/about',
  '/blog',
  '/book',
  '/changelog',
  '/contact',
  '/design-system',
  '/edge',
  '/edge-office-hours',
  '/edge-private',
  '/faq',
  '/gallery',
  '/pricing',
  '/reviews',
  '/services',
  '/admin/edge',
  '/admin/schedule',
  '/admin/booked',
  '/admin/create-container',
  '/nerdstage-raffle',
  '/onsite',
]

const TOLERANCE_PX = 4 // subpixel/scrollbar rendering artifact threshold

const CHECK_JS = `(() => ({
  hasOverflow: document.documentElement.scrollWidth > window.innerWidth + ${TOLERANCE_PX},
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: window.innerWidth,
}))()`

const OFFENDERS_JS = `(() => {
  const r = []
  for (const el of document.querySelectorAll('*')) {
    const rect = el.getBoundingClientRect()
    if (rect.right > window.innerWidth + 5) {
      r.push({
        tag: el.tagName,
        id: el.id || null,
        cls: el.className?.toString() || null,
        text: el.textContent?.trim().slice(0, 80) || null,
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      })
      if (r.length >= 5) break
    }
  }
  return r
})()`

type OverflowResult = { hasOverflow: boolean; scrollWidth: number; clientWidth: number }
type Offender = {
  tag: string
  id: string | null
  cls: string | null
  text: string | null
  right: number
  width: number
}

const overflowing: Array<{ route: string; result: OverflowResult; offenders: Offender[] }> = []
const clean: string[] = []

console.log(`\n🔍 Checking ${ROUTES.length} routes for horizontal overflow at ${BASE_URL}...\n`)

const VIEWPORTS = [
  { label: 'mobile', width: 375, height: 812 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1280, height: 800 },
]

const browser = await chromium.launch()
const page = await browser.newPage()

for (const route of ROUTES) {
  const url = `${BASE_URL}${route}`
  const failures: string[] = []

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10_000 })
      const result = (await page.evaluate(CHECK_JS)) as OverflowResult

      if (result.hasOverflow) {
        if (isBaselined(route, vp.label)) {
          failures.push(`${vp.label}(baselined)`)
        } else {
          const offenders = (await page.evaluate(OFFENDERS_JS)) as Offender[]
          overflowing.push({ route: `${route} @${vp.label}`, result, offenders })
          failures.push(`${vp.label}(+${result.scrollWidth - result.clientWidth}px)`)
        }
      }
    } catch {
      failures.push(`${vp.label}(err)`)
    }
  }

  if (failures.length > 0) {
    console.log(`  ${route.padEnd(35)}❌  ${failures.join(' ')}`)
  } else {
    clean.push(route)
    console.log(`  ${route.padEnd(35)}✅`)
  }
}

await browser.close()

console.log(`\n${'─'.repeat(60)}`)
console.log(`✅ Clean: ${clean.length}  ❌ Overflowing: ${overflowing.length}`)

if (overflowing.length > 0) {
  console.log(`\n── Offenders ──────────────────────────────────────────────\n`)
  for (const { route, result, offenders } of overflowing) {
    console.log(
      `❌ ${route}  (scrollWidth: ${result.scrollWidth}, clientWidth: ${result.clientWidth})`
    )
    for (const o of offenders) {
      console.log(`   ${o.tag}${o.id ? `#${o.id}` : ''}  right: ${o.right}px  width: ${o.width}px`)
      if (o.cls) console.log(`      cls: ${o.cls}`)
      if (o.text) console.log(`      txt: ${o.text}`)
    }
    console.log()
  }
  process.exit(1)
}

console.log('\n✨ No overflow detected.\n')
