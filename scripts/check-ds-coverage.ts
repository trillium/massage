#!/usr/bin/env bun
/**
 * check-ds-coverage.ts — verify every primitive in components/ui/ has a
 * matching entry in components/ui/manifest.ts.
 *
 * This is the third leg of the design-system enforcement tripod:
 *   - check-design-system.ts  enforces per-file in lint-staged
 *   - audit-ui.ts             sweeps the whole repo for violations
 *   - check-ds-coverage.ts    proves the manifest itself stays complete
 *
 * Scope: top-level files in `components/ui/` only. The atoms/ subdirectory
 * holds domain helpers, not design-system primitives, so it is excluded.
 * Test files (.test.tsx) and the manifest itself are also excluded.
 *
 * Exit codes:
 *   0  every primitive is covered
 *   1  one or more primitives have no manifest entry
 */

import { readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { DS_RULES } from '../components/ui/manifest'

const REPO_ROOT = process.cwd()
const UI_DIR = resolve(REPO_ROOT, 'components/ui')

function collectPrimitives(): string[] {
  let entries: string[]
  try {
    entries = readdirSync(UI_DIR)
  } catch (err) {
    process.stderr.write(
      `check-ds-coverage: cannot read ${UI_DIR} — run from repo root.\n${String(err)}\n`
    )
    process.exit(2)
  }
  const results: string[] = []
  for (const entry of entries) {
    if (!entry.endsWith('.tsx')) continue
    if (entry.endsWith('.test.tsx') || entry.endsWith('.spec.tsx')) continue
    const full = join(UI_DIR, entry)
    let stat
    try {
      stat = statSync(full)
    } catch {
      continue
    }
    if (!stat.isFile()) continue
    results.push(full)
  }
  return results.sort()
}

function importPathFor(absFile: string): string {
  const rel = relative(REPO_ROOT, absFile).replace(/\\/g, '/')
  const stripped = rel.replace(/\.tsx$/, '')
  return '@/' + stripped
}

const primitives = collectPrimitives()
const covered = new Set(DS_RULES.map((r) => r.importPath))
const uncovered = primitives.filter((file) => !covered.has(importPathFor(file)))

if (uncovered.length === 0) {
  process.stdout.write(
    `check-ds-coverage: OK — ${primitives.length} primitives, ${DS_RULES.length} manifest entries.\n`
  )
  process.exit(0)
}

process.stderr.write(
  `check-ds-coverage: ${uncovered.length} primitive(s) in components/ui/ have no manifest entry.\n\n`
)
for (const file of uncovered) {
  const rel = relative(REPO_ROOT, file)
  const expectedImport = importPathFor(file)
  process.stderr.write(`  ${rel}\n      expected importPath: '${expectedImport}'\n\n`)
}
process.stderr.write(
  `Add an entry to components/ui/manifest.ts so the enforcement scripts and ` +
    `the /design-system page learn about this primitive.\n`
)
process.exit(1)
