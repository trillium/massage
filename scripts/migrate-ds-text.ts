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

const write = process.argv.includes('--write')
const audit = JSON.parse(readFileSync('/dev/stdin', 'utf8'))
const files = audit.files
  .filter((f: { violations: { rule: string }[] }) => f.violations.some((v: { rule: string }) => v.rule === 'raw-p'))
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

function mergeImport(existing: string, newNames: string[]): string | null {
  // Single-line: import { A, B } from '...'
  const single = existing.match(/^import\s+\{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/)
  if (single) {
    const current = single[1].split(',').map(s => s.trim())
    const merged = [...new Set([...current, ...newNames])]
    return `import { ${merged.join(', ')} } from '${single[2]}'`
  }
  // Multi-line: import {\n  A,\n  B,\n} from '...'
  const multi = existing.match(/^import\s+\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"]/)
  if (multi) {
    const current = multi[1].split(',').map(s => s.trim().replace(/\n\s*$/, ''))
    // Add new names that aren't already present
    for (const n of newNames) {
      if (!current.some(c => c.replace(/^type\s+/, '') === n)) {
        current.push(n)
      }
    }
    return `import {\n  ${current.join(',\n  ')},\n} from '${multi[2]}'`
  }
  return null
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
    if (chars[i] === '<' && chars[i + 1] === 'p' && chars[i + 2] !== '/' && !/[a-z]/i.test(chars[i + 2] ?? '')) {
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
    if (
      chars[i] === '<' &&
      chars[i + 1] === '/' &&
      chars[i + 2] === 'p' &&
      chars[i + 3] === '>'
    ) {
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

  // ── Add/merge imports ─────────────────────────────────
  if (needed.size > 0) {
    const importPath = '@/components/ui/text'
    // Match full import block (single or multi-line)
    const importRegex = new RegExp(
      `import\\s*\\{[\\s\\S]*?\\}\\s*from\\s*['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
    )
    const existingImport = result.match(importRegex)

    if (existingImport) {
      const fullBlock = existingImport[0]
      // Extract names inside { ... }
      const namesMatch = fullBlock.match(/\{([\s\S]*)\}/)
      if (namesMatch) {
        const existingNames = namesMatch[1]
          .split(',')
          .map(s => s.trim().replace(/\n/g, ''))
          .filter(Boolean)
        const toAdd = [...needed].filter(n => !existingNames.some(e => e.replace(/^type\s+/, '') === n))
        if (toAdd.length > 0) {
          const isMultiLine = fullBlock.includes('\n')
          let replacement: string
          if (isMultiLine) {
            const nameList = namesMatch[1].trimEnd().replace(/,+\s*$/, '')
            replacement = fullBlock.replace(namesMatch[1], nameList + `,\n  ${toAdd.join(',\n  ')},\n`)
          } else {
            replacement = fullBlock.replace(/\}(?=\s*from)/, `${toAdd.join(', ')}}`)
          }
          writeFileSync(file, result.replace(existingImport[0], replacement))
          modified++
          continue
        }
      }
    } else {
      // No existing import — add a new one
      const lines = result.split('\n')
      let lastImportIdx = -1
      for (let i2 = 0; i2 < lines.length; i2++) {
        if (/^import\s/.test(lines[i2])) lastImportIdx = i2
      }
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, '', `import { ${[...needed].join(', ')} } from '${importPath}'`)
      }
      writeFileSync(file, lines.join('\n'))
      modified++
      continue
    }
  }

  writeFileSync(file, result)
  modified++

  modified++
}

console.log(`\n${write ? 'Modified' : 'Would modify'} ${modified} files`)
if (!write) console.log('Pass --write to apply changes')
