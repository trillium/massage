#!/usr/bin/env bun
/**
 * Migrate <p> elements to design-system Text components.
 *
 * Size detection: text-xs → TextXs, text-sm → TextSm, text-lg → TextLg, else → TextBase
 * Closing </p> always maps to the matching variant's close tag via stack tracking.
 *
 * Usage: bun scripts/audit-ui.ts | bun scripts/migrate-ds-text.ts [--write]
 *        (reads audit JSON from stdin, --write to apply, dry-run by default)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { ensureImports } from './lib/imports'

const write = process.argv.includes('--write')
const audit = JSON.parse(readFileSync('/dev/stdin', 'utf8'))
const files = audit.files
  .filter((f: { violations: { rule: string }[] }) =>
    f.violations.some((v: { rule: string }) => v.rule === 'raw-p')
  )
  .map((f: { path: string }) => f.path)
  .sort()

const uiDir = /\/components\/ui\//

function detectVariant(openTag: string): string {
  const clsMatch = openTag.match(/className\s*=\s*(?:"([^"]*)"|'([^']*)'|{([^}]+)})/)
  const cls = clsMatch?.[1] ?? clsMatch?.[2] ?? clsMatch?.[3] ?? ''
  if (/\btext-xs\b/.test(cls)) return 'TextXs'
  if (/\btext-sm\b/.test(cls)) return 'TextSm'
  if (/\btext-lg\b/.test(cls)) return 'TextLg'
  return 'TextBase'
}

let modified = 0
for (const file of files) {
  if (uiDir.test(file)) {
    if (write) console.error(`Skip DS component file: ${file}`)
    continue
  }

  const content = readFileSync(file, 'utf8')
  if (!content.includes('<p')) continue

  // Walk through the file character by character, tracking open/close p tags
  // to determine the right closing variant for each pair.
  const chars = [...content]
  const out: string[] = []
  const variantStack: string[] = []
  const needed = new Set<string>()
  let i = 0

  while (i < chars.length) {
    // Check for opening <p tag (exact match — not <path, <pre, etc.)
    if (
      chars[i] === '<' &&
      chars[i + 1] === 'p' &&
      chars[i + 2] !== '/' &&
      !/[a-z]/i.test(chars[i + 2] ?? '')
    ) {
      const start = i
      // Find the end of the opening tag
      let end = i + 2
      while (end < chars.length && chars[end] !== '>') end++
      if (end < chars.length) end++ // include the >

      const openTag = chars.slice(i, end).join('')
      const variant = detectVariant(openTag)
      variantStack.push(variant)
      needed.add(variant)

      // Emit the replacement opening tag (keep all attrs, just change tag name)
      const attrs = openTag.slice(2, -1) // everything between <p and >
      out.push(`<${variant}${attrs}>`)
      i = end
      continue
    }

    // Check for closing </p> tag
    if (chars[i] === '<' && chars[i + 1] === '/' && chars[i + 2] === 'p' && chars[i + 3] === '>') {
      const variant = variantStack.pop() || 'TextBase'
      out.push(`</${variant}>`)
      i += 4
      continue
    }

    out.push(chars[i])
    i++
  }

  if (variantStack.length > 0) {
    console.error(`WARN: unclosed <p> tags in ${file} (${variantStack.length})`)
  }

  const result = out.join('')
  if (result === content) continue

  if (!write) {
    console.log(`${file}`)
    modified++
    continue
  }

  // ── Add/merge imports using shared utilities ──────────
  if (needed.size > 0) {
    const entries = [...needed].map((name) => ({ name, path: '@/components/ui/text' }))
    const final = ensureImports(result, entries)
    writeFileSync(file, final)
    modified++
    continue
  }

  writeFileSync(file, result)
  modified++
}

console.log(`\n${write ? 'Modified' : 'Would modify'} ${modified} files`)
if (!write) console.log('Pass --write to apply changes')
