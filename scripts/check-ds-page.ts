#!/usr/bin/env bun
/**
 * check-ds-page.ts — every component in the manifest must appear on the
 * /design-system page. Runs on every lint-staged invocation so the page
 * stays in sync with manifest.ts.
 *
 * Exit codes:
 *   0  all manifest components are documented on the page
 *   1  one or more components are missing
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { DS_COMPONENTS_BY_CATEGORY } from '../components/ui/manifest'

const PAGE_PATH = resolve(import.meta.dir, '..', 'app/design-system/page.tsx')
const SECTIONS_DIR = resolve(import.meta.dir, '..', 'app/design-system/sections')

const COMPONENT_NAMES = Object.values(DS_COMPONENTS_BY_CATEGORY).flat()

function readSectionSources(dir: string): string {
  let combined = ''
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isFile() && (entry.endsWith('.tsx') || entry.endsWith('.ts'))) {
        combined += `\n${readFileSync(full, 'utf8')}`
      }
    }
  } catch {
    return combined
  }
  return combined
}

let pageSource: string
try {
  pageSource = readFileSync(PAGE_PATH, 'utf8') + readSectionSources(SECTIONS_DIR)
} catch {
  process.stderr.write(`check-ds-page: cannot read ${PAGE_PATH}\n`)
  process.exit(2)
}

const missing: string[] = []
for (const name of COMPONENT_NAMES) {
  const re = new RegExp(`\\b${name}\\b`)
  if (!re.test(pageSource)) {
    missing.push(name)
  }
}

if (missing.length === 0) process.exit(0)

const byCategory: Record<string, string[]> = {}
for (const [cat, names] of Object.entries(DS_COMPONENTS_BY_CATEGORY)) {
  for (const name of names as readonly string[]) {
    if (missing.includes(name)) {
      ;(byCategory[cat] ??= []).push(name)
    }
  }
}

process.stderr.write(
  `check-ds-page: components in manifest but missing from /design-system page\n\n`
)
for (const [cat, names] of Object.entries(byCategory)) {
  for (const name of names) {
    process.stderr.write(`  ${cat}: ${name}\n`)
  }
}
process.stderr.write(
  `\nAdd a demonstration section for each missing component in app/design-system/page.tsx\n`
)
process.exit(1)
