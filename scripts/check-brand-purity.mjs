#!/usr/bin/env node
/**
 * check-brand-purity.mjs — block `@/content` and `@/data` imports in files
 * that are exempt from biome's `noJsxLiterals` rule.
 *
 * Those exempt files own their strings by design (OG image generators are
 * the canonical case). Importing from the content layer would re-couple
 * brand/structural files to runtime content and defeat the exemption.
 *
 * Source of truth for which files are exempt is `biome.json` — we read the
 * overrides array and intersect with each file path supplied as argv.
 *
 * Usage (lint-staged passes file paths as argv):
 *   node scripts/check-brand-purity.mjs <file> [<file> ...]
 *
 * Exit codes:
 *   0  clean
 *   1  one or more files in the exempt list imported from a banned root
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, relative, sep, posix } from 'node:path'
import process from 'node:process'

const REPO_ROOT = process.cwd()
const BIOME_PATH = resolve(REPO_ROOT, 'biome.json')

const BANNED_IMPORT_RE = /from\s+['"](@\/content|@\/data)(\/[^'"]*)?['"]/

function toPosix(p) {
  return p.split(sep).join(posix.sep)
}

function loadExemptPatterns() {
  if (!existsSync(BIOME_PATH)) return []
  try {
    const biome = JSON.parse(readFileSync(BIOME_PATH, 'utf8'))
    const overrides = Array.isArray(biome?.overrides) ? biome.overrides : []
    const patterns = []
    for (const ov of overrides) {
      const offNoJsxLiterals = ov?.linter?.rules?.style?.noJsxLiterals === 'off'
      if (!offNoJsxLiterals) continue
      const includes = Array.isArray(ov?.includes) ? ov.includes : []
      for (const inc of includes) {
        if (typeof inc === 'string') patterns.push(inc)
      }
    }
    return patterns
  } catch (e) {
    process.stderr.write(`check-brand-purity: failed to parse biome.json (${e.message})\n`)
    return []
  }
}

function globToRegExp(pattern) {
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

function fileMatchesAny(filePosix, patterns) {
  for (const p of patterns) {
    if (globToRegExp(p).test(filePosix)) return true
  }
  return false
}

function checkFile(absFile, patterns) {
  if (!existsSync(absFile)) return null
  const rel = toPosix(relative(REPO_ROOT, absFile))
  if (!fileMatchesAny(rel, patterns)) return null
  const source = readFileSync(absFile, 'utf8')
  const lines = source.split('\n')
  const offending = []
  for (let i = 0; i < lines.length; i++) {
    const m = BANNED_IMPORT_RE.exec(lines[i])
    if (m) offending.push({ line: i + 1, importRoot: m[1], excerpt: lines[i].trim() })
  }
  if (offending.length === 0) return null
  return { file: rel, offending }
}

function main() {
  const patterns = loadExemptPatterns()
  if (patterns.length === 0) {
    process.exit(0)
  }

  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  if (args.length === 0) process.exit(0)

  const violations = []
  for (const arg of args) {
    const abs = resolve(REPO_ROOT, arg)
    const v = checkFile(abs, patterns)
    if (v) violations.push(v)
  }

  if (violations.length === 0) process.exit(0)

  process.stderr.write(
    `check-brand-purity: files exempt from noJsxLiterals must not import from @/content or @/data\n\n`
  )
  for (const v of violations) {
    for (const off of v.offending) {
      process.stderr.write(
        `  ${v.file}:${off.line}  imports from ${off.importRoot}\n` + `      ${off.excerpt}\n\n`
      )
    }
  }
  process.stderr.write(
    `These files own their strings by design. Either inline the strings or remove the biome override.\n`
  )
  process.exit(1)
}

main()
