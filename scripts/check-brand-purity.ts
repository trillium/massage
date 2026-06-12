#!/usr/bin/env bun
/**
 * check-brand-purity.ts — block `@/content` and `@/data` imports in files
 * that are exempt from biome's `noJsxLiterals` rule.
 *
 * Usage (lint-staged passes file paths as argv):
 *   bun scripts/check-brand-purity.ts <file> [<file> ...]
 *
 * Exit codes:
 *   0  clean
 *   1  one or more files in the exempt list imported from a banned root
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, relative, sep, posix } from 'node:path'

interface Offending {
  line: number
  importRoot: string
  excerpt: string
}

interface Violation {
  file: string
  offending: Offending[]
}

const REPO_ROOT = process.cwd()
const BIOME_PATH = resolve(REPO_ROOT, 'biome.json')
const BANNED_IMPORT_RE = /from\s+['"](@\/content|@\/data)(\/[^'"]*)?['"]/

function toPosix(p: string): string {
  return p.split(sep).join(posix.sep)
}

function loadExemptPatterns(): string[] {
  if (!existsSync(BIOME_PATH)) return []
  try {
    const biome = JSON.parse(readFileSync(BIOME_PATH, 'utf8'))
    const overrides: unknown[] = Array.isArray(biome?.overrides) ? biome.overrides : []
    const patterns: string[] = []
    for (const ov of overrides) {
      const o = ov as Record<string, unknown>
      const offNoJsxLiterals =
        (o?.linter as Record<string, unknown>)?.rules &&
        ((o.linter as Record<string, unknown>).rules as Record<string, unknown>)?.style &&
        (
          ((o.linter as Record<string, unknown>).rules as Record<string, unknown>).style as Record<
            string,
            unknown
          >
        )?.noJsxLiterals === 'off'
      if (!offNoJsxLiterals) continue
      const includes = Array.isArray(o?.includes) ? o.includes : []
      for (const inc of includes) {
        if (typeof inc === 'string') patterns.push(inc)
      }
    }
    return patterns
  } catch (e) {
    process.stderr.write(
      `check-brand-purity: failed to parse biome.json (${(e as Error).message})\n`
    )
    return []
  }
}

function globToRegExp(pattern: string): RegExp {
  let re = ''
  let i = 0
  while (i < pattern.length) {
    const c = pattern[i]
    if (c === '*' && pattern[i + 1] === '*') {
      if (pattern[i + 2] === '/') {
        re += '(?:.*/)?'
        i += 3
      } else {
        re += '.*'
        i += 2
      }
      continue
    }
    if (c === '*') {
      re += '[^/]*'
      i += 1
      continue
    }
    if (c === '?') {
      re += '[^/]'
      i += 1
      continue
    }
    if ('.+^${}()|[]\\'.includes(c)) {
      re += '\\' + c
      i += 1
      continue
    }
    re += c
    i += 1
  }
  return new RegExp('^' + re + '$')
}

function fileMatchesAny(filePosix: string, patterns: string[]): boolean {
  return patterns.some((p) => globToRegExp(p).test(filePosix))
}

function checkFile(absFile: string, patterns: string[]): Violation | null {
  if (!existsSync(absFile)) return null
  const rel = toPosix(relative(REPO_ROOT, absFile))
  if (!fileMatchesAny(rel, patterns)) return null
  const source = readFileSync(absFile, 'utf8')
  const lines = source.split('\n')
  const offending: Offending[] = []
  for (let i = 0; i < lines.length; i++) {
    const m = BANNED_IMPORT_RE.exec(lines[i])
    if (m) offending.push({ line: i + 1, importRoot: m[1], excerpt: lines[i].trim() })
  }
  return offending.length ? { file: rel, offending } : null
}

const patterns = loadExemptPatterns()
if (patterns.length === 0) process.exit(0)

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
if (args.length === 0) process.exit(0)

const violations = args
  .map((a) => checkFile(resolve(REPO_ROOT, a), patterns))
  .filter(Boolean) as Violation[]
if (violations.length === 0) process.exit(0)

process.stderr.write(
  `check-brand-purity: files exempt from noJsxLiterals must not import from @/content or @/data\n\n`
)
for (const v of violations) {
  for (const off of v.offending) {
    process.stderr.write(
      `  ${v.file}:${off.line}  imports from ${off.importRoot}\n      ${off.excerpt}\n\n`
    )
  }
}
process.stderr.write(
  `These files own their strings by design. Either inline the strings or remove the biome override.\n`
)
process.exit(1)
