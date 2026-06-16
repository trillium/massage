#!/usr/bin/env bun
/**
 * Shared import utilities for design-system codemod scripts.
 *
 * Consolidates 4 different import-handling approaches that existed across 7 scripts
 * into a single, tested module.
 *
 * Usage:
 *   import { ensureImports, hasImport } from './lib/imports'
 *
 *   const result = ensureImports(source, [
 *     { name: 'Box', path: '@/components/ui/box' },
 *     { name: 'Stack', path: '@/components/ui/stack' },
 *   ])
 */

export interface ImportEntry {
  name: string
  path: string
}

const IMPORT_LINE_RE = /^import\s/

/**
 * Find the index of the last import line. Walks past multi-line
 * import continuations and blank lines after the import block.
 */
export function findLastImportLine(lines: string[]): number {
  let last = -1
  let continuation = false

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    if (continuation) {
      if (trimmed.endsWith(';') || trimmed.endsWith("'") || trimmed.endsWith('"')) {
        continuation = false
        last = i
      }
      continue
    }

    if (IMPORT_LINE_RE.test(trimmed)) {
      last = i
      if (!/ from /.test(trimmed)) continuation = true
    }
  }

  return last
}

/**
 * Check if a component is already imported from the given path.
 */
export function hasImport(source: string, name: string, path: string): boolean {
  const escaped = path.replace(/[/.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(
    `import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*['"]${escaped}['"]`,
    'm'
  )
  return re.test(source)
}

/**
 * Find an existing import line for the given path.
 * Returns the line index and set of already-imported names.
 */
export function findExistingImport(
  lines: string[],
  importPath: string
): { lineIndex: number; names: Set<string>; rawLine: string } | null {
  const escaped = importPath.replace(/[/.*+?^${}()|[\]\\]/g, '\\$&')
  const rx = new RegExp(`^\\s*import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${escaped}['"]`)
  for (let i = 0; i < lines.length; i++) {
    const m = rx.exec(lines[i])
    if (m) {
      const names = new Set(
        m[1]
          .split(',')
          .map((s) => s.trim().replace(/\n/g, ''))
          .filter(Boolean)
      )
      return { lineIndex: i, names, rawLine: lines[i] }
    }
  }
  return null
}

/**
 * Ensure all given imports exist in the source.
 *
 * For each unique import path:
 *   - If an import for that path already exists, merge new names into it.
 *   - Otherwise, insert a new import line after the last import line.
 *
 * Handles single-line and multi-line import blocks.
 * Handles multi-line import continuation in findLastImportLine.
 */
export function ensureImports(source: string, entries: ImportEntry[]): string {
  if (entries.length === 0) return source

  // Group by path
  const byPath = new Map<string, Set<string>>()
  for (const { name, path } of entries) {
    if (!byPath.has(path)) byPath.set(path, new Set())
    byPath.get(path)!.add(name)
  }

  const lines = source.split('\n')
  const newImportLines: string[] = []

  for (const [path, names] of byPath) {
    const existing = findExistingImport(lines, path)
    if (existing) {
      // Merge new names into existing import
      for (const n of names) existing.names.add(n)
      const sorted = [...existing.names].sort()
      lines[existing.lineIndex] = `import { ${sorted.join(', ')} } from '${path}'`
    } else {
      // Will insert a new import line
      const sorted = [...names].sort()
      newImportLines.push(`import { ${sorted.join(', ')} } from '${path}'`)
    }
  }

  if (newImportLines.length > 0) {
    const insertAt = findLastImportLine(lines) + 1
    lines.splice(insertAt, 0, ...newImportLines)
  }

  return lines.join('\n')
}
