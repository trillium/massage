#!/usr/bin/env bun
/**
 * migrate-ds-elements.ts — codemod that renames bare HTML elements to their
 * design-system component equivalents across the codebase.
 *
 * Substitutions (each DS component accepts all HTML props, so this is a
 * mechanical rename — no semantic changes):
 *
 *   <p …>      → <Text …>      </p>     → </Text>      (import { Text })
 *   <h1 …>     → <Heading level={1} …>  </h1>    → </Heading>   (import { Heading })
 *   <h2 …>     → <Heading level={2} …>  </h2>    → </Heading>
 *   <h3 …>     → <Heading level={3} …>  </h3>    → </Heading>
 *   <h4 …>     → <Heading level={4} …>  </h4>    → </Heading>
 *   <code …>   → <Code …>      </code>  → </Code>      (import { Code })
 *   <div …>    → <Box …>       </div>   → </Box>       (import { Box })
 *
 * Does NOT touch <button>, <input>, <textarea> (semantic decisions required).
 *
 * Skips:
 *   - components/ui/**           (DS sources, self-exempt)
 *   - **\/*.test.tsx, *.spec.tsx (tests)
 *   - node_modules, .next, .contentlayer, coverage, .claude
 *   - files with a leading /* ds-ignore-file *\/ marker
 *
 * Usage:
 *   bun scripts/migrate-ds-elements.ts --dry-run                 # report only
 *   bun scripts/migrate-ds-elements.ts                           # apply changes
 *   bun scripts/migrate-ds-elements.ts --file path/to/file.tsx   # single file
 *
 * Idempotency: opening-tag regexes use word-boundary lookaheads
 * (?=[\s>\/]) so they only match raw HTML elements, never JSX components
 * (<Text>, <Heading>, <Box>, <Code> all start with uppercase). Re-running
 * the script on the same file is a no-op.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const REPO_ROOT = process.cwd()
const DS_IGNORE_FILE = /\/\*\s*ds-ignore-file\s*\*\//

const SKIP_DIRS = new Set(['.next', 'node_modules', '.contentlayer', 'coverage', '.claude', '.git'])

const SCAN_ROOTS = ['app', 'components']

type TagKey = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'code' | 'div'

interface Substitution {
  key: TagKey
  open: RegExp
  openReplacement: string
  close: RegExp
  closeReplacement: string
  componentName: 'Text' | 'Heading' | 'Code' | 'Box'
  importPath: string
}

const SUBSTITUTIONS: Substitution[] = [
  {
    key: 'p',
    open: /<p(?=[\s>/])/g,
    openReplacement: '<Text',
    close: /<\/p>/g,
    closeReplacement: '</Text>',
    componentName: 'Text',
    importPath: '@/components/ui/text',
  },
  {
    key: 'h1',
    open: /<h1(?=[\s>/])/g,
    openReplacement: '<Heading level={1}',
    close: /<\/h1>/g,
    closeReplacement: '</Heading>',
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    key: 'h2',
    open: /<h2(?=[\s>/])/g,
    openReplacement: '<Heading level={2}',
    close: /<\/h2>/g,
    closeReplacement: '</Heading>',
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    key: 'h3',
    open: /<h3(?=[\s>/])/g,
    openReplacement: '<Heading level={3}',
    close: /<\/h3>/g,
    closeReplacement: '</Heading>',
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    key: 'h4',
    open: /<h4(?=[\s>/])/g,
    openReplacement: '<Heading level={4}',
    close: /<\/h4>/g,
    closeReplacement: '</Heading>',
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    key: 'code',
    open: /<code(?=[\s>/])/g,
    openReplacement: '<Code',
    close: /<\/code>/g,
    closeReplacement: '</Code>',
    componentName: 'Code',
    importPath: '@/components/ui/code',
  },
  {
    key: 'div',
    open: /<div(?=[\s>/])/g,
    openReplacement: '<Box',
    close: /<\/div>/g,
    closeReplacement: '</Box>',
    componentName: 'Box',
    importPath: '@/components/ui/box',
  },
]

interface FileResult {
  path: string
  modified: boolean
  counts: Partial<Record<TagKey, number>>
  importsAdded: string[]
}

interface MigrationReport {
  modified: FileResult[]
  skippedIgnore: string[]
  skippedTest: string[]
  totalsByTag: Record<TagKey, number>
}

function parseArgs(argv: string[]): {
  dryRun: boolean
  singleFile: string | null
} {
  const dryRun = argv.includes('--dry-run')
  let singleFile: string | null = null
  const fileIdx = argv.indexOf('--file')
  if (fileIdx !== -1 && argv[fileIdx + 1]) {
    singleFile = argv[fileIdx + 1]
  }
  return { dryRun, singleFile }
}

function isTestPath(relPath: string): boolean {
  return /\.(test|spec)\.tsx?$/.test(relPath)
}

function isComponentsUiPath(relPath: string): boolean {
  const normalized = relPath.split(/[\\/]/).join('/')
  return normalized.startsWith('components/ui/')
}

function collectFiles(): string[] {
  const results: string[] = []

  function walk(dir: string): void {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue
      const full = join(dir, entry)
      let stat
      try {
        stat = statSync(full)
      } catch {
        continue
      }
      if (stat.isDirectory()) {
        walk(full)
      } else if (full.endsWith('.tsx')) {
        results.push(full)
      }
    }
  }

  for (const root of SCAN_ROOTS) {
    const abs = join(REPO_ROOT, root)
    if (existsSync(abs)) walk(abs)
  }
  return results
}

function findImportInsertionIndex(lines: string[]): { index: number; nearUiImport: boolean } {
  let lastImportLine = -1
  let lastUiImportLine = -1
  let inImportBlock = false
  let importContinuation = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (importContinuation) {
      if (trimmed.endsWith(';') || trimmed.endsWith("'") || trimmed.endsWith('"')) {
        importContinuation = false
        lastImportLine = i
        if (line.includes('@/components/ui/')) lastUiImportLine = i
      }
      continue
    }

    if (/^import\b/.test(trimmed)) {
      inImportBlock = true
      lastImportLine = i
      if (line.includes('@/components/ui/')) lastUiImportLine = i
      const hasFrom = / from /.test(line)
      const ends = trimmed.endsWith(';') || trimmed.endsWith("'") || trimmed.endsWith('"')
      if (!hasFrom || !ends) {
        importContinuation = true
      }
      continue
    }

    if (inImportBlock && trimmed === '') {
      continue
    }

    if (inImportBlock && trimmed !== '') {
      break
    }
  }

  if (lastUiImportLine !== -1) {
    return { index: lastUiImportLine + 1, nearUiImport: true }
  }
  if (lastImportLine !== -1) {
    return { index: lastImportLine + 1, nearUiImport: false }
  }
  return { index: 0, nearUiImport: false }
}

function hasImport(source: string, componentName: string, importPath: string): boolean {
  const escapedPath = importPath.replace(/[/.*+?^${}()|[\]\\]/g, '\\$&')
  const namedImport = new RegExp(
    `import\\s*\\{[^}]*\\b${componentName}\\b[^}]*\\}\\s*from\\s*['"]${escapedPath}['"]`,
    'm'
  )
  return namedImport.test(source)
}

function injectImports(source: string, needed: Map<string, string>): string {
  if (needed.size === 0) return source
  const lines = source.split('\n')
  const { index } = findImportInsertionIndex(lines)
  const importLines: string[] = []
  for (const [componentName, importPath] of needed) {
    importLines.push(`import { ${componentName} } from '${importPath}'`)
  }
  lines.splice(index, 0, ...importLines)
  return lines.join('\n')
}

const args = parseArgs(process.argv.slice(2))
const isDryRun = args.dryRun

function processFile(absPath: string): FileResult {
  const relPath = relative(REPO_ROOT, absPath)
  const result: FileResult = {
    path: relPath,
    modified: false,
    counts: {},
    importsAdded: [],
  }

  if (!existsSync(absPath)) return result
  const original = readFileSync(absPath, 'utf8')
  if (DS_IGNORE_FILE.test(original)) return result

  let source = original
  const importsNeeded = new Map<string, string>()

  for (const sub of SUBSTITUTIONS) {
    const openMatches = source.match(sub.open)
    const closeMatches = source.match(sub.close)
    const openCount = openMatches ? openMatches.length : 0
    const closeCount = closeMatches ? closeMatches.length : 0

    if (openCount === 0 && closeCount === 0) continue

    if (openCount > 0) {
      source = source.replace(sub.open, sub.openReplacement)
    }
    if (closeCount > 0) {
      source = source.replace(sub.close, sub.closeReplacement)
    }

    result.counts[sub.key] = openCount

    if (!hasImport(original, sub.componentName, sub.importPath)) {
      if (!importsNeeded.has(sub.componentName)) {
        importsNeeded.set(sub.componentName, sub.importPath)
      }
    }
  }

  if (source === original) return result

  for (const [name] of importsNeeded) result.importsAdded.push(name)

  source = injectImports(source, importsNeeded)
  result.modified = true

  if (!isDryRun) {
    writeFileSync(absPath, source, 'utf8')
  }

  return result
}

function shouldSkipFile(absPath: string): { skip: boolean; reason: 'test' | 'ui' | null } {
  const rel = relative(REPO_ROOT, absPath)
  if (isComponentsUiPath(rel)) return { skip: true, reason: 'ui' }
  if (isTestPath(rel)) return { skip: true, reason: 'test' }
  return { skip: false, reason: null }
}

function run(): MigrationReport {
  const report: MigrationReport = {
    modified: [],
    skippedIgnore: [],
    skippedTest: [],
    totalsByTag: { p: 0, h1: 0, h2: 0, h3: 0, h4: 0, code: 0, div: 0 },
  }

  let files: string[]
  if (args.singleFile) {
    const abs = resolve(REPO_ROOT, args.singleFile)
    if (!existsSync(abs)) {
      process.stderr.write(`Error: file not found: ${args.singleFile}\n`)
      process.exit(1)
    }
    files = [abs]
  } else {
    files = collectFiles()
  }

  for (const abs of files) {
    const { skip, reason } = shouldSkipFile(abs)
    const rel = relative(REPO_ROOT, abs)
    if (skip) {
      if (reason === 'test') report.skippedTest.push(rel)
      continue
    }

    if (existsSync(abs)) {
      const source = readFileSync(abs, 'utf8')
      if (DS_IGNORE_FILE.test(source)) {
        report.skippedIgnore.push(rel)
        continue
      }
    }

    const fileResult = processFile(abs)
    if (fileResult.modified) {
      report.modified.push(fileResult)
      for (const [k, v] of Object.entries(fileResult.counts) as [TagKey, number][]) {
        report.totalsByTag[k] += v
      }
    }
  }

  return report
}

function formatCounts(counts: Partial<Record<TagKey, number>>): string {
  const parts: string[] = []
  const order: TagKey[] = ['p', 'h1', 'h2', 'h3', 'h4', 'code', 'div']
  for (const k of order) {
    const v = counts[k]
    if (v && v > 0) parts.push(`${k}(${v})`)
  }
  return parts.join(' ')
}

function printReport(report: MigrationReport): void {
  const header = isDryRun
    ? 'DS Element Migration (DRY RUN — no files written)'
    : 'DS Element Migration'
  process.stdout.write(`\n${header}\n`)
  process.stdout.write('='.repeat(header.length) + '\n')
  process.stdout.write(`Modified: ${report.modified.length} files\n`)
  process.stdout.write(`Skipped (ds-ignore): ${report.skippedIgnore.length} files\n`)
  process.stdout.write(`Skipped (test): ${report.skippedTest.length} files\n`)
  process.stdout.write(`Substitutions by tag: ${formatCounts(report.totalsByTag)}\n`)
  process.stdout.write('Violations remaining (estimate): run pnpm audit:ui:summary\n\n')

  if (report.modified.length > 0) {
    process.stdout.write('Modified files:\n')
    const sorted = [...report.modified].sort((a, b) => {
      const aTotal = Object.values(a.counts).reduce((s, n) => s + (n ?? 0), 0)
      const bTotal = Object.values(b.counts).reduce((s, n) => s + (n ?? 0), 0)
      return bTotal - aTotal
    })
    for (const f of sorted) {
      const counts = formatCounts(f.counts)
      const importsLabel = f.importsAdded.length > 0 ? ` [+${f.importsAdded.join(', ')}]` : ''
      process.stdout.write(`  ${f.path} — ${counts}${importsLabel}\n`)
    }
    process.stdout.write('\n')
  }
}

const report = run()
printReport(report)
