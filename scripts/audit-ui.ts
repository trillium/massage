#!/usr/bin/env bun
/**
 * audit-ui.ts — full-codebase design system violation scanner
 *
 * Mirrors check-design-system.ts logic but sweeps the whole repo instead of
 * running per-file in lint-staged. Use this to see the full violation backlog.
 *
 * Rules are sourced from components/ui/manifest.ts — the single source of
 * truth shared with check-design-system.ts and the design-system page.
 *
 * Usage:
 *   bun scripts/audit-ui.ts              # prints JSON report
 *   bun scripts/audit-ui.ts --summary    # prints summary table only
 *   bun scripts/audit-ui.ts --file path  # scan a single file
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, relative, join, sep, posix } from 'node:path'
import { DS_RULES, type DsRule } from '../components/ui/manifest'

const DS_IGNORE_FILE = /\/\*\s*ds-ignore-file\s*\*\//
const DS_IGNORE_LINE = /\/\/\s*ds-ignore/

interface Violation {
  line: number
  rule: string
  component: string
  hint?: string
  noEscapeHatch?: boolean
  excerpt: string
}

interface FileReport {
  path: string
  violations: Violation[]
}

interface AuditReport {
  totalViolations: number
  totalFiles: number
  files: FileReport[]
}

const REPO_ROOT = process.cwd()
const args = process.argv.slice(2)
const summaryOnly = args.includes('--summary')
const singleFile = args.includes('--file') ? args[args.indexOf('--file') + 1] : null

const SKIP_DIRS = ['.next', 'node_modules', '.contentlayer', 'coverage', '.claude']

function toPosix(p: string): string {
  return sep === posix.sep ? p : p.split(sep).join(posix.sep)
}

function isSelfFile(absFile: string, rule: DsRule): boolean {
  if (!rule.selfExempt) return false
  const posixFile = toPosix(absFile)
  const importPath = rule.importPath.replace(/^@\//, '/')
  if (!importPath.match(/\.[a-z]+$/)) {
    return (
      posixFile.includes(importPath + '/') ||
      posixFile.includes(importPath + '.tsx') ||
      posixFile.includes(importPath + '.ts')
    )
  }
  return posixFile.includes(importPath + '.tsx') || posixFile.includes(importPath + '.ts')
}

function lineMatches(line: string, rule: DsRule): boolean {
  for (const p of rule.patterns) {
    if (p.jsx?.test(line)) return true
    if (p.className?.test(line)) return true
    if (p.jsxStyle && p.jsxStyle.element.test(line) && p.jsxStyle.styling.test(line)) return true
  }
  return false
}

function collectFiles(): string[] {
  if (singleFile) return [resolve(REPO_ROOT, singleFile)]
  const results: string[] = []
  function walk(dir: string) {
    let entries: string[]
    try {
      entries = require('node:fs').readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (SKIP_DIRS.includes(entry)) continue
      const full = join(dir, entry)
      let stat: import('node:fs').Stats
      try {
        stat = require('node:fs').statSync(full)
      } catch {
        continue
      }
      if (stat.isDirectory()) walk(full)
      else if (full.endsWith('.tsx') || full.endsWith('.jsx')) results.push(full)
    }
  }
  walk(join(REPO_ROOT, 'components'))
  walk(join(REPO_ROOT, 'app'))
  return results
}

function scanFile(absPath: string): Violation[] {
  if (!existsSync(absPath)) return []
  const source = readFileSync(absPath, 'utf8')
  const fileIgnored = DS_IGNORE_FILE.test(source)
  const lines = source.split('\n')
  const violations: Violation[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineIgnored = DS_IGNORE_LINE.test(line)
    for (const rule of DS_RULES) {
      if (fileIgnored && !rule.noEscapeHatch) continue
      if (lineIgnored && !rule.noEscapeHatch) continue
      if (isSelfFile(absPath, rule)) continue
      if (lineMatches(line, rule)) {
        violations.push({
          line: i + 1,
          rule: rule.name,
          component: rule.component,
          hint: rule.hint,
          noEscapeHatch: rule.noEscapeHatch,
          excerpt: line.trim().slice(0, 100),
        })
      }
    }
  }
  return violations
}

const report: AuditReport = { totalViolations: 0, totalFiles: 0, files: [] }

for (const file of collectFiles()) {
  const violations = scanFile(file)
  if (violations.length === 0) continue
  const rel = relative(REPO_ROOT, file)
  report.totalViolations += violations.length
  report.totalFiles++
  report.files.push({ path: rel, violations })
}

report.files.sort((a, b) => b.violations.length - a.violations.length)

if (summaryOnly) {
  process.stdout.write(
    `\nUI Audit — ${report.totalViolations} violations across ${report.totalFiles} files\n\n`
  )
  for (const f of report.files) {
    process.stdout.write(`  ${String(f.violations.length).padStart(4)}  ${f.path}\n`)
  }
  process.stdout.write('\n')
} else {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
}
