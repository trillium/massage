#!/usr/bin/env bun
/**
 * migrate-ds-divs.ts — AST-based codemod that renames all <div> elements to <Box>
 * while preserving all attributes (className, onClick, etc.).
 *
 * Because <Box> wraps a <div> and accepts className + HTMLAttributes, this is
 * a mechanical rename — no semantic changes, no prop extraction needed.
 *
 * Skips:
 *   - components/ui/**           (DS sources, self-exempt)
 *   - **\/*.test.tsx, *.spec.tsx (tests)
 *   - node_modules, .next, .contentlayer, coverage, .claude
 *   - files with a leading /* ds-ignore-file *\/ marker
 *
 * Usage:
 *   bun scripts/migrate-ds-divs.ts --dry-run
 *   bun scripts/migrate-ds-divs.ts
 */

import { Project, SyntaxKind } from 'ts-morph'
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { ensureImports } from './lib/imports'

const REPO_ROOT = process.cwd()
const DS_IGNORE_FILE = /\/\*\s*ds-ignore-file\s*\*\//
const SKIP_DIRS = new Set(['.next', 'node_modules', '.contentlayer', 'coverage', '.claude', '.git'])
const SCAN_ROOTS = ['app', 'components']

const dryRun = process.argv.includes('--dry-run')

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { allowJs: false, jsx: 4 },
})

interface Replacement {
  start: number
  end: number
  newText: string
}

interface FileResult {
  path: string
  modified: boolean
  count: number
}

function isComponentsUiPath(relPath: string): boolean {
  return relPath.split(/[\\/]/).join('/').startsWith('components/ui/')
}

function isTestPath(relPath: string): boolean {
  return /\.(test|spec)\.tsx?$/.test(relPath)
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

function processFile(absPath: string): FileResult | null {
  const relPath = relative(REPO_ROOT, absPath)

  if (isComponentsUiPath(relPath)) return null
  if (isTestPath(relPath)) return null

  let sourceFile
  try {
    sourceFile = project.addSourceFileAtPath(absPath)
  } catch {
    return null
  }

  const originalText = sourceFile.getFullText()
  if (DS_IGNORE_FILE.test(originalText)) {
    project.removeSourceFile(sourceFile)
    return null
  }

  const replacements: Replacement[] = []
  let count = 0

  sourceFile.forEachDescendant((node) => {
    const kind = node.getKind()

    if (kind === SyntaxKind.JsxOpeningElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxOpeningElement)
      if (el.getTagNameNode().getText() !== 'div') return
      const tagNode = el.getTagNameNode()
      replacements.push({ start: tagNode.getStart(), end: tagNode.getEnd(), newText: 'Box' })
      count++
      return
    }

    if (kind === SyntaxKind.JsxClosingElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxClosingElement)
      if (el.getTagNameNode().getText() !== 'div') return
      const tagNode = el.getTagNameNode()
      replacements.push({ start: tagNode.getStart(), end: tagNode.getEnd(), newText: 'Box' })
      count++
      return
    }

    if (kind === SyntaxKind.JsxSelfClosingElement) {
      const el = node.asKindOrThrow(SyntaxKind.JsxSelfClosingElement)
      if (el.getTagNameNode().getText() !== 'div') return
      const tagNode = el.getTagNameNode()
      replacements.push({ start: tagNode.getStart(), end: tagNode.getEnd(), newText: 'Box' })
      count++
    }
  })

  project.removeSourceFile(sourceFile)

  if (replacements.length === 0) return null

  const sorted = replacements.sort((a, b) => b.start - a.start || b.end - a.end)
  let text = originalText
  for (const r of sorted) {
    text = text.slice(0, r.start) + r.newText + text.slice(r.end)
  }

  text = ensureImports(text, [{ name: 'Box', path: '@/components/ui/box' }])

  if (!dryRun) {
    writeFileSync(absPath, text, 'utf8')
  }

  return { path: relPath, modified: true, count }
}

const files = collectFiles()
let totalModified = 0
let totalDivs = 0
const skippedIgnore: string[] = []
const skippedTest: string[] = []

console.log(`\n${dryRun ? 'DRY RUN — ' : ''}Div → Box Migration\n${'='.repeat(50)}`)

for (const file of files) {
  const relPath = relative(REPO_ROOT, file)
  const result = processFile(file)

  if (result) {
    totalModified++
    totalDivs += result.count
    console.log(`  ${result.path} —  [+Box ×${result.count}]`)
  }
}

console.log(`\nModified: ${totalModified} files`)
console.log(`Divs replaced: ${totalDivs}`)
if (totalDivs === 0) {
  console.log('No divs remaining — codebase is clean.\n')
}
