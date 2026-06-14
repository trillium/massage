#!/usr/bin/env bun
/**
 * audit-text-variants.ts — scan <p>, <span>, <h*> elements and extract
 * unique Tailwind text/font/color class combinations.
 *
 * Usage:
 *   bun scripts/audit-text-variants.ts            # full inventory JSON
 *   bun scripts/audit-text-variants.ts --summary  # ranked table
 *
 * Output shape:
 * {
 *   "variants": [
 *     {
 *       "classes": "text-sm font-bold text-accent-500",
 *       "suggestedName": "TextSmBoldAccent",
 *       "count": 12,
 *       "tag": "p",
 *       "occurrences": [{ "file": "...", "line": 4 }]
 *     }
 *   ]
 * }
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

// Classes that define the text STYLE — absorbed into the component
const TEXT_CLASS_PREFIXES = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'font-thin',
  'font-light',
  'font-normal',
  'font-medium',
  'font-semibold',
  'font-bold',
  'font-extrabold',
  'font-black',
  'italic',
  'not-italic',
  'leading-none',
  'leading-tight',
  'leading-snug',
  'leading-normal',
  'leading-relaxed',
  'leading-loose',
  'tracking-tighter',
  'tracking-tight',
  'tracking-normal',
  'tracking-wide',
  'tracking-wider',
  'tracking-widest',
  'text-accent-',
  'text-primary-',
  'text-secondary-',
  'text-surface-',
  'text-white',
  'text-black',
  'text-transparent',
  'dark:text-',
]

const SKIP_DIRS = ['.next', 'node_modules', '.contentlayer', 'coverage', '.claude', 'components/ui']

const DS_IGNORE = /\/\*\s*ds-ignore-file\s*\*\//
const TAG_RX = /<(p|span|h[1-6])\b([^>]*?)>/g
const CLASS_ATTR_RX = /className=["']([^"']+)["']/

const REPO_ROOT = process.cwd()
const args = process.argv.slice(2)
const summaryOnly = args.includes('--summary')

function isTextClass(cls: string): boolean {
  return TEXT_CLASS_PREFIXES.some((prefix) => cls === prefix || cls.startsWith(prefix))
}

function extractTextClasses(className: string): string[] {
  return className.split(/\s+/).filter(isTextClass).sort()
}

function suggestName(tag: string, classes: string[]): string {
  const parts: string[] = []

  // Base tag prefix
  if (tag === 'p' || tag === 'span') parts.push('Text')
  else if (tag === 'h1') parts.push('H1')
  else if (tag === 'h2') parts.push('H2')
  else if (tag === 'h3') parts.push('H3')
  else if (tag === 'h4') parts.push('H4')
  else if (tag === 'h5') parts.push('H5')
  else if (tag === 'h6') parts.push('H6')

  // Size
  const size = classes.find((c) => /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/.test(c))
  if (size) {
    const sizeMap: Record<string, string> = {
      'text-xs': 'Xs',
      'text-sm': 'Sm',
      'text-base': 'Base',
      'text-lg': 'Lg',
      'text-xl': 'Xl',
      'text-2xl': '2xl',
      'text-3xl': '3xl',
      'text-4xl': '4xl',
      'text-5xl': '5xl',
    }
    parts.push(sizeMap[size] ?? size.replace('text-', ''))
  }

  // Weight
  const weight = classes.find((c) => c.startsWith('font-'))
  if (weight) {
    const weightMap: Record<string, string> = {
      'font-medium': 'Medium',
      'font-semibold': 'Semibold',
      'font-bold': 'Bold',
      'font-extrabold': 'Extrabold',
      'font-light': 'Light',
    }
    parts.push(weightMap[weight] ?? weight.replace('font-', ''))
  }

  // Color semantic
  if (
    classes.some(
      (c) => c.includes('accent-400') || c.includes('accent-500') || c.includes('accent-600')
    )
  ) {
    parts.push('Muted')
  } else if (classes.some((c) => c.includes('primary-'))) {
    parts.push('Primary')
  } else if (classes.some((c) => c.includes('white'))) {
    parts.push('White')
  }

  return parts.join('')
}

interface Occurrence {
  file: string
  line: number
}
interface Variant {
  classes: string
  suggestedName: string
  tag: string
  count: number
  occurrences: Occurrence[]
}

function collectFiles(): string[] {
  const results: string[] = []
  function walk(dir: string) {
    let entries: string[]
    try {
      entries = require('node:fs').readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry)
      if (SKIP_DIRS.some((s) => full.includes(`/${s}/`) || full.endsWith(`/${s}`))) continue
      let stat
      try {
        stat = require('node:fs').statSync(full)
      } catch {
        continue
      }
      if (stat.isDirectory()) walk(full)
      else if (full.endsWith('.tsx') || full.endsWith('.jsx')) results.push(full)
    }
  }
  walk(join(REPO_ROOT, 'app'))
  walk(join(REPO_ROOT, 'components'))
  return results
}

const variantMap = new Map<string, Variant>()

for (const file of collectFiles()) {
  const source = readFileSync(file, 'utf8')
  if (DS_IGNORE.test(source)) continue
  const lines = source.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let m: RegExpExecArray | null
    TAG_RX.lastIndex = 0
    while ((m = TAG_RX.exec(line)) !== null) {
      const tag = m[1]
      const attrs = m[2]
      const classMatch = CLASS_ATTR_RX.exec(attrs)
      if (!classMatch) continue
      const textClasses = extractTextClasses(classMatch[1])
      if (textClasses.length === 0) continue
      const key = `${tag}|${textClasses.join(' ')}`
      if (!variantMap.has(key)) {
        variantMap.set(key, {
          classes: textClasses.join(' '),
          suggestedName: suggestName(tag, textClasses),
          tag,
          count: 0,
          occurrences: [],
        })
      }
      const v = variantMap.get(key)!
      v.count++
      v.occurrences.push({ file: relative(REPO_ROOT, file), line: i + 1 })
    }
  }
}

const variants = [...variantMap.values()].sort((a, b) => b.count - a.count)

if (summaryOnly) {
  const total = variants.reduce((s, v) => s + v.count, 0)
  process.stdout.write(
    `\nText Variant Inventory — ${variants.length} unique variants, ${total} total occurrences\n\n`
  )
  process.stdout.write(
    `${'Count'.padStart(6)}  ${'Tag'.padEnd(6)}  ${'Suggested Component'.padEnd(24)}  Classes\n`
  )
  process.stdout.write(`${'-'.repeat(80)}\n`)
  for (const v of variants) {
    process.stdout.write(
      `${String(v.count).padStart(6)}  ${v.tag.padEnd(6)}  ${v.suggestedName.padEnd(24)}  ${v.classes}\n`
    )
  }
  process.stdout.write('\n')
} else {
  process.stdout.write(JSON.stringify({ variants }, null, 2) + '\n')
}
