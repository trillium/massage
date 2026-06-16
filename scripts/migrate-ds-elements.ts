#!/usr/bin/env bun
/**
 * migrate-ds-elements.ts — AST-based codemod (ts-morph) that renames bare HTML elements
 * to design-system component equivalents across the codebase.
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
 *   <input …>  → <Input …>    </input> → </Input>    (import { Input })
 *   <button …> → <Button …>   </button>→ </Button>   (import { Button })
 *   <textarea …>→ <Textarea …></textarea>→ </Textarea> (import { Textarea })
 *
 * Skips <input type="checkbox|radio"> (not text fields, DS Input is text-only).
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
 * Correctness note: uses ts-morph AST to find JSX nodes, so template literals,
 * comments, and string content containing <div> etc. are never matched.
 */

import { Project, SyntaxKind } from 'ts-morph'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { hasImport, ensureImports } from './lib/imports'

const REPO_ROOT = process.cwd()
const DS_IGNORE_FILE = /\/\*\s*ds-ignore-file\s*\*\//

const SKIP_DIRS = new Set(['.next', 'node_modules', '.contentlayer', 'coverage', '.claude', '.git'])

const SCAN_ROOTS = ['app', 'components']

function isCheckboxOrRadio(
  el: import('ts-morph').JsxOpeningElement | import('ts-morph').JsxSelfClosingElement
): boolean {
  const attr = el.getAttribute('type')
  if (!attr || attr.getKind() !== SyntaxKind.JsxAttribute) return false
  const init = (attr as import('ts-morph').JsxAttribute).getInitializer()
  if (!init || init.getKind() !== SyntaxKind.StringLiteral) return false
  const val = init.asKindOrThrow(SyntaxKind.StringLiteral).getLiteralValue()
  return val === 'checkbox' || val === 'radio'
}

type TagKey = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'code' | 'input' | 'button' | 'textarea'

interface Substitution {
  htmlTag: TagKey
  componentTag: string
  levelProp?: number
  componentName: 'Text' | 'Heading' | 'Code' | 'Input' | 'Button' | 'Textarea'
  importPath: string
}

const SUBSTITUTIONS: Substitution[] = [
  {
    htmlTag: 'p',
    componentTag: 'Text',
    componentName: 'Text',
    importPath: '@/components/ui/text',
  },
  {
    htmlTag: 'h1',
    componentTag: 'Heading',
    levelProp: 1,
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    htmlTag: 'h2',
    componentTag: 'Heading',
    levelProp: 2,
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    htmlTag: 'h3',
    componentTag: 'Heading',
    levelProp: 3,
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    htmlTag: 'h4',
    componentTag: 'Heading',
    levelProp: 4,
    componentName: 'Heading',
    importPath: '@/components/ui/heading',
  },
  {
    htmlTag: 'code',
    componentTag: 'Code',
    componentName: 'Code',
    importPath: '@/components/ui/code',
  },
  {
    htmlTag: 'input',
    componentTag: 'Input',
    componentName: 'Input',
    importPath: '@/components/ui/input',
  },
  {
    htmlTag: 'button',
    componentTag: 'Button',
    componentName: 'Button',
    importPath: '@/components/ui/button',
  },
  {
    htmlTag: 'textarea',
    componentTag: 'Textarea',
    componentName: 'Textarea',
    importPath: '@/components/ui/textarea',
  },
]

const SUB_BY_TAG = new Map<string, Substitution>(SUBSTITUTIONS.map((s) => [s.htmlTag, s]))

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

function parseArgs(argv: string[]): { dryRun: boolean; singleFile: string | null } {
  const dryRun = argv.includes('--dry-run')
  let singleFile: string | null = null
  const fileIdx = argv.indexOf('--file')
  if (fileIdx !== -1 && argv[fileIdx + 1]) singleFile = argv[fileIdx + 1]
  return { dryRun, singleFile }
}

function isTestPath(relPath: string): boolean {
  return /\.(test|spec)\.tsx?$/.test(relPath)
}

function isComponentsUiPath(relPath: string): boolean {
  return relPath.split(/[\\/]/).join('/').startsWith('components/ui/')
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

const args = parseArgs(process.argv.slice(2))
const isDryRun = args.dryRun

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { allowJs: false, jsx: 4 },
})

interface Replacement {
  start: number
  end: number
  newText: string
}

function processFile(absPath: string): FileResult {
  const relPath = relative(REPO_ROOT, absPath)
  const empty: FileResult = { path: relPath, modified: false, counts: {}, importsAdded: [] }

  let sourceFile
  try {
    sourceFile = project.addSourceFileAtPath(absPath)
  } catch {
    process.stderr.write(`  ⚠ skipping ${relPath} (parse error)\n`)
    return empty
  }

  const originalText = sourceFile.getFullText()
  if (DS_IGNORE_FILE.test(originalText)) {
    project.removeSourceFile(sourceFile)
    return empty
  }

  const replacements: Replacement[] = []
  const importsNeeded = new Map<string, string>()
  const counts: Partial<Record<TagKey, number>> = {}

  sourceFile.forEachDescendant((node) => {
    const kind = node.getKind()

    if (kind === SyntaxKind.JsxOpeningElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxOpeningElement)
      const tagText = el.getTagNameNode().getText()
      const sub = SUB_BY_TAG.get(tagText)
      if (!sub) return
      if (sub.htmlTag === 'input' && isCheckboxOrRadio(el)) return
      counts[sub.htmlTag] = (counts[sub.htmlTag] ?? 0) + 1
      importsNeeded.set(sub.componentName, sub.importPath)
      const tagNode = el.getTagNameNode()
      replacements.push({
        start: tagNode.getStart(),
        end: tagNode.getEnd(),
        newText: sub.componentTag,
      })
      if (sub.levelProp !== undefined) {
        replacements.push({
          start: tagNode.getEnd(),
          end: tagNode.getEnd(),
          newText: ` level={${sub.levelProp}}`,
        })
      }
      return
    }

    if (kind === SyntaxKind.JsxClosingElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxClosingElement)
      const tagText = el.getTagNameNode().getText()
      const sub = SUB_BY_TAG.get(tagText)
      if (!sub) return
      const tagNode = el.getTagNameNode()
      replacements.push({
        start: tagNode.getStart(),
        end: tagNode.getEnd(),
        newText: sub.componentTag,
      })
      return
    }

    if (kind === SyntaxKind.JsxSelfClosingElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxSelfClosingElement)
      const tagText = el.getTagNameNode().getText()
      const sub = SUB_BY_TAG.get(tagText)
      if (!sub) return
      if (sub.htmlTag === 'input' && isCheckboxOrRadio(el)) return
      counts[sub.htmlTag] = (counts[sub.htmlTag] ?? 0) + 1
      importsNeeded.set(sub.componentName, sub.importPath)
      const tagNode = el.getTagNameNode()
      replacements.push({
        start: tagNode.getStart(),
        end: tagNode.getEnd(),
        newText: sub.componentTag,
      })
      if (sub.levelProp !== undefined) {
        replacements.push({
          start: tagNode.getEnd(),
          end: tagNode.getEnd(),
          newText: ` level={${sub.levelProp}}`,
        })
      }
    }
  })

  project.removeSourceFile(sourceFile)

  if (replacements.length === 0) return empty

  const sorted = replacements.sort((a, b) => b.start - a.start || b.end - a.end)
  let text = originalText
  for (const r of sorted) {
    text = text.slice(0, r.start) + r.newText + text.slice(r.end)
  }

  const needed: Array<{ name: string; path: string }> = []
  for (const [componentName, importPath] of importsNeeded) {
    if (!hasImport(originalText, componentName, importPath)) {
      needed.push({ name: componentName, path: importPath })
    }
  }

  text = ensureImports(text, needed)

  if (!isDryRun) {
    writeFileSync(absPath, text, 'utf8')
  }

  return {
    path: relPath,
    modified: true,
    counts,
    importsAdded: [...importsNeeded.keys()],
  }
}

function shouldSkipFile(absPath: string): { skip: boolean; reason: 'test' | 'ui' | null } {
  const rel = relative(REPO_ROOT, absPath)
  if (isComponentsUiPath(rel)) return { skip: true, reason: 'ui' }
  if (isTestPath(rel)) return { skip: true, reason: 'test' }
  return { skip: false, reason: null }
}

async function run(): Promise<MigrationReport> {
  const report: MigrationReport = {
    modified: [],
    skippedIgnore: [],
    skippedTest: [],
    totalsByTag: { p: 0, h1: 0, h2: 0, h3: 0, h4: 0, code: 0 },
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
      const text = readFileSync(abs, 'utf8')
      if (DS_IGNORE_FILE.test(text)) {
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
  const order: TagKey[] = ['p', 'h1', 'h2', 'h3', 'h4', 'code']
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

const report = await run()
printReport(report)
