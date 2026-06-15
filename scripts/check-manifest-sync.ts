#!/usr/bin/env bun
/**
 * check-manifest-sync.ts — ensures every component in components/ui/ is registered
 * in DS_COMPONENT_NAMES in manifest.ts.
 *
 * Usage (lint-staged passes file paths as argv):
 *   bun scripts/check-manifest-sync.ts <file> [<file> ...]
 *
 * Exit codes:
 *   0  all components accounted for
 *   1  one or more exported components missing from DS_COMPONENT_NAMES
 */

import { readFileSync } from 'node:fs'
import { DS_COMPONENT_NAMES } from '../components/ui/manifest'

const registered = new Set<string>(DS_COMPONENT_NAMES)

const EXPORT_RE = /export\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9]*)/g
const REEXPORT_RE = /export\s+\{([^}]+)\}/g

function extractComponentNames(source: string): string[] {
  const names: string[] = []
  for (const [, name] of source.matchAll(EXPORT_RE)) {
    if (name && /^[A-Z]/.test(name)) names.push(name)
  }
  for (const [, group] of source.matchAll(REEXPORT_RE)) {
    for (const part of group.split(',')) {
      const name = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.trim()
      if (name && /^[A-Z]/.test(name)) names.push(name)
    }
  }
  return names
}

const args = process.argv.slice(2).filter((f) => f.includes('components/ui/') && f.endsWith('.tsx'))
const missing: { file: string; component: string }[] = []

for (const file of args) {
  if (file.endsWith('manifest.ts')) continue
  const source = readFileSync(file, 'utf8')
  for (const name of extractComponentNames(source)) {
    if (!registered.has(name)) {
      missing.push({ file, component: name })
    }
  }
}

if (missing.length === 0) process.exit(0)

process.stderr.write(
  `check-manifest-sync: components exported from components/ui/ but missing from DS_COMPONENT_NAMES in manifest.ts\n\n`
)
for (const { file, component } of missing) {
  process.stderr.write(`  ${file}: ${component}\n`)
}
process.stderr.write(`\nAdd the missing names to DS_COMPONENT_NAMES in components/ui/manifest.ts\n`)
process.exit(1)
