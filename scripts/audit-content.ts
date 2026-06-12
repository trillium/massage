#!/usr/bin/env bun
/**
 * audit-content.ts — full-codebase noJsxLiterals violation scanner
 *
 * Runs `biome check --reporter=json` across the repo and extracts all
 * lint/style/noJsxLiterals violations. Biome is the source of truth —
 * no separate Python parser needed.
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
 *         { "line": 44, "text": "Incorrect use of string literal detected." }
 *       ]
 *     }
 *   ]
 * }
 */

import { execSync } from 'node:child_process'

interface BiomeDiagnostic {
  category: string
  message: string
  location: {
    path: string
    start: { line: number; column: number }
  }
}

interface BiomeOutput {
  diagnostics: BiomeDiagnostic[]
}

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

const args = process.argv.slice(2)
const summaryOnly = args.includes('--summary')
const singleFile = args.includes('--file') ? args[args.indexOf('--file') + 1] : null

const target = singleFile ?? '.'

let raw: string
try {
  raw = execSync(`bunx biome check --reporter=json ${target}`, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
    maxBuffer: 50 * 1024 * 1024,
  })
} catch (e) {
  // biome exits 1 when violations found — capture stdout anyway
  raw = (e as { stdout?: string }).stdout ?? ''
}

let parsed: BiomeOutput
try {
  parsed = JSON.parse(raw) as BiomeOutput
} catch {
  process.stderr.write('audit-content: failed to parse biome JSON output\n')
  process.exit(2)
}

const byFile = new Map<string, Violation[]>()
for (const d of parsed.diagnostics ?? []) {
  if (d.category !== 'lint/style/noJsxLiterals') continue
  const path = d.location?.path ?? 'unknown'
  if (!byFile.has(path)) byFile.set(path, [])
  byFile.get(path)!.push({ line: d.location?.start?.line ?? 0, text: d.message })
}

const report: AuditReport = {
  totalViolations: 0,
  totalFiles: byFile.size,
  files: [],
}

for (const [path, violations] of byFile) {
  report.totalViolations += violations.length
  report.files.push({ path, violations })
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
