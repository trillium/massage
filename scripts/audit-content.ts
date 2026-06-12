#!/usr/bin/env bun
/**
 * audit-content.ts — full-codebase content violation scanner
 *
 * Runs the _lint-content-extract.py helper against every .tsx/.ts file in
 * the repo and produces a structured JSON report of all bare JSX text nodes
 * that should live in the content layer.
 *
 * Usage:
 *   bun scripts/audit-content.ts              # prints JSON report
 *   bun scripts/audit-content.ts --summary    # prints summary table only
 *   bun scripts/audit-content.ts --file path  # scan a single file
 *
 * Output shape (JSON):
 * {
 *   "totalViolations": 42,
 *   "totalFiles": 12,
 *   "files": [
 *     {
 *       "path": "components/Footer.tsx",
 *       "violations": [
 *         { "line": 44, "text": "Quick Links" },
 *         { "line": 80, "text": "Services" }
 *       ]
 *     }
 *   ]
 * }
 */

import { execSync } from 'node:child_process'
import { readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

interface Violation {
  line: number
  text: string
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
const HELPER = join(REPO_ROOT, 'scripts/_lint-content-extract.py')
const PY = process.env.PYTHON ?? 'python3'

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.contentlayer',
  'coverage',
  '__tests__',
  'og-variants',
  'design-system',
  'designs',
  'og-preview',
  '.git',
  '.claude',
])

const SKIP_PATH_PATTERNS = [/\.test\.(ts|tsx)$/, /\.spec\.(ts|tsx)$/, /\/data\//]

function* walkTs(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      yield* walkTs(join(dir, entry.name))
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      const full = join(dir, entry.name)
      const rel = relative(REPO_ROOT, full)
      if (!SKIP_PATH_PATTERNS.some((p) => p.test(rel))) yield full
    }
  }
}

function scanFile(filePath: string): Violation[] {
  try {
    const out = execSync(`"${PY}" "${HELPER}" "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
    if (!out) return []
    return out
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const colonIdx = line.indexOf(':')
        return {
          line: Number.parseInt(line.slice(0, colonIdx), 10),
          text: line.slice(colonIdx + 1),
        }
      })
  } catch {
    return []
  }
}

const args = process.argv.slice(2)
const summaryOnly = args.includes('--summary')
const singleFile = args.includes('--file') ? args[args.indexOf('--file') + 1] : null

const files = singleFile ? [join(REPO_ROOT, singleFile)] : [...walkTs(REPO_ROOT)]

const report: AuditReport = { totalViolations: 0, totalFiles: 0, files: [] }

for (const file of files) {
  if (!existsSync(file)) continue
  const violations = scanFile(file)
  if (violations.length === 0) continue
  report.totalViolations += violations.length
  report.totalFiles += 1
  report.files.push({ path: relative(REPO_ROOT, file), violations })
}

report.files.sort((a, b) => b.violations.length - a.violations.length)

if (summaryOnly) {
  process.stdout.write(
    `\nContent Audit — ${report.totalViolations} violations across ${report.totalFiles} files\n\n`
  )
  for (const f of report.files) {
    process.stdout.write(`  ${String(f.violations.length).padStart(4)}  ${f.path}\n`)
  }
  process.stdout.write('\n')
} else {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
}
