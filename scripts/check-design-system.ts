#!/usr/bin/env bun
/**
 * check-design-system.ts — pattern-based guard against raw HTML elements
 * that should use design-system components.
 *
 * Usage (lint-staged passes file paths as argv):
 *   bun scripts/check-design-system.ts <file> [<file> ...]
 *
 * Exit codes:
 *   0  clean
 *   1  one or more files violated a rule
 *
 * Escape hatches:
 *   - `// ds-ignore` on a line — skips that single line
 *   - `/* ds-ignore-file *\/` anywhere in the file — skips the whole file
 *
 * Rules are sourced from components/ui/manifest.ts — the single source of
 * truth shared with audit-ui.ts and the design-system page.
 */

import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, sep, posix } from 'node:path'
import { DS_RULES, type DsRule } from '../components/ui/manifest'

interface Finding {
  file: string
  line: number
  rule: string
  component: string
  importPath: string
  hint?: string
  noEscapeHatch?: boolean
  excerpt: string
}

const FILE_OPT_OUT = '/* ds-ignore-file */'
const LINE_OPT_OUT = '// ds-ignore'
const LINE_OPT_OUT_JSX = '{/* ds-ignore */}'

function isSourceFile(file: string): boolean {
  return /\.(tsx|ts|jsx|js)$/.test(file)
}

function shouldSkipPath(file: string): boolean {
  if (file.includes('/node_modules/')) return true
  if (file.includes('/.next/')) return true
  if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return true
  if (file.endsWith('.spec.ts') || file.endsWith('.spec.tsx')) return true
  if (file.includes('/__tests__/')) return true
  if (file.startsWith('scripts/') || file.includes('/scripts/')) return true
  return false
}

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

function checkFile(file: string): Finding[] {
  if (!existsSync(file)) return []
  try {
    if (!statSync(file).isFile()) return []
  } catch {
    return []
  }
  const source = readFileSync(file, 'utf8')
  const fileIgnored = source.includes(FILE_OPT_OUT)

  const absFile = resolve(file)
  const lines = source.split('\n')
  const findings: Finding[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const windowStart = Math.max(0, i - 3)
    const windowEnd = Math.min(lines.length - 1, i + 4)
    const lineIgnored = lines
      .slice(windowStart, windowEnd)
      .some((l) => l.includes(LINE_OPT_OUT) || l.includes(LINE_OPT_OUT_JSX))
    for (const rule of DS_RULES) {
      if (fileIgnored && !rule.noEscapeHatch) continue
      if (lineIgnored && !rule.noEscapeHatch) continue
      if (isSelfFile(absFile, rule)) continue
      if (lineMatches(line, rule)) {
        findings.push({
          file,
          line: i + 1,
          rule: rule.name,
          component: rule.component,
          importPath: rule.importPath,
          hint: rule.hint,
          noEscapeHatch: rule.noEscapeHatch,
          excerpt: line.trim(),
        })
      }
    }
  }
  return findings
}

function getStagedLineNumbers(file: string): Set<number> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require('child_process')
    const diff = execSync(`git diff --cached -- "${file}"`, { encoding: 'utf8' })
    if (!diff) return null
    const added = new Set<number>()
    let cur = 0
    for (const line of diff.split('\n')) {
      const m = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
      if (m) {
        cur = parseInt(m[1], 10) - 1
        continue
      }
      if (line.startsWith('+') && !line.startsWith('+++')) {
        cur++
        added.add(cur)
      } else if (!line.startsWith('-') && !line.startsWith('\\')) cur++
    }
    return added.size > 0 ? added : null
  } catch {
    return null
  }
}

const rawArgs = process.argv.slice(2)
const stagedOnly = rawArgs.includes('--staged-only')
const args = rawArgs.filter((a) => !a.startsWith('-'))
const files = args.filter(isSourceFile).filter((f) => !shouldSkipPath(f))
if (files.length === 0) process.exit(0)

const stagedLinesCache = new Map<string, Set<number> | null>()

function checkFileFiltered(file: string): Finding[] {
  const findings = checkFile(file)
  if (!stagedOnly) return findings
  let staged = stagedLinesCache.get(file)
  if (staged === undefined) {
    staged = getStagedLineNumbers(file)
    stagedLinesCache.set(file, staged)
  }
  if (!staged) return [] // file not staged — skip entirely
  return findings.filter((f) => staged!.has(f.line))
}

const allFindings = files.flatMap(checkFileFiltered)
if (allFindings.length === 0) process.exit(0)

process.stderr.write(`check-design-system: design system violation\n\n`)
for (const f of allFindings) {
  const action = f.hint ?? `use ${f.component} from ${f.importPath}`
  const noEscape = f.noEscapeHatch ? '  [no escape hatch]' : ''
  process.stderr.write(
    `  ${f.file}:${f.line}  [${f.rule}]${noEscape}\n  → ${action}\n      ${f.excerpt}\n\n`
  )
}
process.stderr.write(
  `Escape hatch: \`// ds-ignore\` or \`/* ds-ignore-file */\` — not available for rules marked [no escape hatch].\n`
)
process.exit(1)
