#!/usr/bin/env bun
/**
 * Migrate <span> elements to design-system Text components with as="span".
 *
 * Size detection: same as migrate-ds-text.ts
 *
 * Usage: bun scripts/audit-ui.ts | bun scripts/migrate-ds-spans.ts [--write]
 */
import { readFileSync, writeFileSync } from 'node:fs'

const write = process.argv.includes('--write')
const audit = JSON.parse(readFileSync('/dev/stdin', 'utf8'))
const files = audit.files
  .filter((f: { violations: { rule: string }[] }) => f.violations.some((v: { rule: string }) => v.rule === 'raw-span'))
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
  if (uiDir.test(file)) continue

  const content = readFileSync(file, 'utf8')
  if (!content.includes('<span')) continue

  const chars = [...content]
  const out: string[] = []
  const needed = new Set<string>()
  const variantStack: string[] = []
  let i = 0

  while (i < chars.length) {
    // Opening <span> (not </span>, not <span with trailing letter like <spanner)
    if (chars[i] === '<' && chars[i + 1] === 's' && chars[i + 2] === 'p' && chars[i + 3] === 'a' && chars[i + 4] === 'n' && chars[i + 5] !== '/' && !/[a-z]/i.test(chars[i + 5] ?? '')) {
      const start = i
      let end = i + 5
      while (end < chars.length && chars[end] !== '>') end++
      if (end < chars.length) end++

      const openTag = chars.slice(i, end).join('')
      const variant = detectVariant(openTag)
      variantStack.push(variant)
      needed.add(variant)

      const attrs = openTag.slice(5, -1)
      out.push(`<${variant} as="span"${attrs}>`)
      i = end
      continue
    }

    // Closing </span>
    if (chars[i] === '<' && chars[i + 1] === '/' && chars[i + 2] === 's' && chars[i + 3] === 'p' && chars[i + 4] === 'a' && chars[i + 5] === 'n' && chars[i + 6] === '>') {
      const variant = variantStack.pop() || 'TextBase'
      out.push(`</${variant}>`)
      i += 7
      continue
    }

    out.push(chars[i])
    i++
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
    const pathEscaped = importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const importRegex = new RegExp(`import\\s*\\{[\\s\\S]*?\\}\\s*from\\s*['"]${pathEscaped}['"]`)
    const existingImport = result.match(importRegex)

    if (existingImport) {
      const fullBlock = existingImport[0]
      const namesMatch = fullBlock.match(/\{([\s\S]*)\}/)
      if (namesMatch) {
        const existingNames = namesMatch[1].split(',').map(s => s.trim().replace(/\n/g, '')).filter(Boolean)
        const toAdd = [...needed].filter(n => !existingNames.some(e => e.replace(/^type\s+/, '') === n))
        if (toAdd.length > 0) {
          const isMultiLine = fullBlock.includes('\n')
          let replacement: string
          if (isMultiLine) {
            const nameList = namesMatch[1].trimEnd().replace(/,+\s*$/, '')
            replacement = fullBlock.replace(namesMatch[1], nameList + `,\n  ${toAdd.join(',\n  ')},\n`)
          } else {
            replacement = fullBlock.replace(/\}(?=\s*from)/, `${toAdd.join(', ')}`)
          }
          writeFileSync(file, result.replace(existingImport[0], replacement))
          modified++
          continue
        }
      }
    } else {
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
}

console.log(`\n${write ? 'Modified' : 'Would modify'} ${modified} files`)
if (!write) console.log('Pass --write to apply changes')
