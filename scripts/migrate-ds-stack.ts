#!/usr/bin/env bun
/**
 * @deprecated Use migrate-ds-stack-ast.ts instead — this regex version misses
 * clsx() containers, responsive variant detection, and remaining-class
 * pass-through that the AST version handles.
 */
import { ensureImports } from './lib/imports'

/**
 * Codemod: migrate <div className="flex ..."> → <Stack direction align justify gap wrap>
 *
 * Usage:
 *   bun scripts/audit-ui.ts | bun scripts/migrate-ds-stack.ts [--write]
 *
 * Reads audit JSON from stdin, replaces flex-container <div> elements with <Stack>.
 * Skips:
 *   - Flex-child-only divs (flex-1, flex-shrink, etc.)
 *   - Responsive variant patterns (sm:flex-row, etc.)
 *   - inline-flex containers (Stack is block-level)
 *   - gap values not in gapMap (0, 0.5, px, arbitrary)
 *
 * ⚠ DEPRECATED: Use migrate-ds-stack-ast.ts instead.
 */

interface Violation {
  line: number
  col: number
  rule: string
  excerpt?: string
}
interface AuditFile {
  path: string
  violations: Violation[]
}
interface Audit {
  files: AuditFile[]
}

// Classes to check for (matched in priority order)
const directionPattern = /\b(?:flex-col|flex-row)\b/
const inlineFlexPattern = /\binline-flex\b/
const flexChildPattern = /\bflex-(?:1|auto|initial|none|grow|shrink)\b/
const responsiveVariantsPattern = /(?:sm|md|lg|xl):(?:flex|items|justify|gap)/

const classToProp: [RegExp, string, string][] = [
  [/^flex-col$/, 'direction', 'col'],
  [/^flex-row$/, 'direction', 'row'],
  [/^flex-wrap$/, 'wrap', ''],
  [/^items-start$/, 'align', 'start'],
  [/^items-center$/, 'align', 'center'],
  [/^items-end$/, 'align', 'end'],
  [/^items-stretch$/, 'align', 'stretch'],
  [/^justify-start$/, 'justify', 'start'],
  [/^justify-center$/, 'justify', 'center'],
  [/^justify-end$/, 'justify', 'end'],
  [/^justify-between$/, 'justify', 'between'],
  [/^gap-1$/, 'gap', '1'],
  [/^gap-2$/, 'gap', '2'],
  [/^gap-3$/, 'gap', '3'],
  [/^gap-4$/, 'gap', '4'],
  [/^gap-6$/, 'gap', '6'],
  [/^gap-8$/, 'gap', '8'],
]

function isFlexContainerDiv(excerpt: string): boolean {
  // Must be a <div> with className containing "flex" (but not just flex-child)
  if (!/<div[^>]*\b(flex|inline-flex)\b/.test(excerpt)) return false
  // Skip inline-flex
  if (inlineFlexPattern.test(excerpt)) return false
  // Skip if only flex-child patterns (no bare "flex")
  if (
    flexChildPattern.test(excerpt) &&
    !/\bflex\b/.test(excerpt.replace(/\bflex-(?:1|auto|initial|none|grow|shrink)\b/g, ''))
  )
    return false
  return true
}

function hasResponsiveVariants(excerpt: string): boolean {
  return responsiveVariantsPattern.test(excerpt)
}

function parseFlexClasses(className: string): { props: string[][]; remaining: string[] } {
  const tokens = className.split(/\s+/).filter(Boolean)
  const props: string[][] = []
  const remaining: string[] = []
  let hadFlex = false

  for (const token of tokens) {
    let matched = false
    for (const [regex, prop, value] of classToProp) {
      if (regex.test(token)) {
        if (prop === 'direction' && value === 'row') {
          // direction="row" is default for bare "flex" - skip adding prop
          // but still consume the token
          hadFlex = true
          matched = true
          break
        }
        props.push([prop, value])
        matched = true
        break
      }
    }
    if (matched) continue
    // Consume bare "flex" (denotes row direction, no prop needed)
    if (token === 'flex') {
      hadFlex = true
      continue
    }
    remaining.push(token)
  }

  // If no direction prop was set and hadFlex was the only direction,
  // we need direction="row" since Stack defaults to "col"
  const hasDirection = props.some(([p]) => p === 'direction')
  if (hadFlex && !hasDirection) {
    props.unshift(['direction', 'row'])
  }

  return { props, remaining }
}

function formatProps(props: string[][]): string {
  if (props.length === 0) return ''
  return (
    ' ' +
    props
      .map(([k, v]) => {
        if (k === 'wrap') return k
        if (k === 'gap') return `${k}={${v}}`
        return `${k}="${v}"`
      })
      .join(' ')
  )
}

function migrateFile(file: AuditFile): string | null {
  const content = Bun.spawnSync(['cat', file.path]).stdout.toString()
  if (!content) return null

  const lines = content.split('\n')
  const stackLines = new Set<number>()
  const violationsByLine = new Map<number, Violation[]>()

  for (const v of file.violations) {
    if (v.rule === 'raw-stack') {
      if (!violationsByLine.has(v.line)) violationsByLine.set(v.line, [])
      violationsByLine.get(v.line)!.push(v)
    }
  }

  if (violationsByLine.size === 0) return null

  let changed = false

  for (const [lineNum, violations] of violationsByLine) {
    const idx = lineNum - 1
    const line = lines[idx]
    if (!line) continue

    const excerpt = violations[0]?.excerpt || line
    if (!isFlexContainerDiv(excerpt)) continue
    if (hasResponsiveVariants(excerpt)) continue

    // Extract className from <div ... className="..."> preserving leading whitespace
    // Also capture everything after the opening tag's > (content + optional close tag)
    const classMatch = line.match(/^(\s*)<div\b([^>]*?)\s+className="([^"]*?)"([^>]*?)\/?>(.*)$/)
    if (!classMatch) continue

    const indent = classMatch[1]
    const beforeClass = classMatch[2]
    const className = classMatch[3]
    const afterClass = classMatch[4]
    const restOfLine = classMatch[5] // content + optional </div>
    const isSelfClosing = line.includes('/>') && !restOfLine.trim()

    const { props, remaining } = parseFlexClasses(className)
    const remainingClass = remaining.length > 0 ? ` className="${remaining.join(' ')}"` : ''
    const stackProps = formatProps(props)

    if (isSelfClosing) {
      lines[idx] = `${indent}<Stack${beforeClass}${remainingClass}${stackProps}${afterClass} />`
    } else if (restOfLine.includes('</div>')) {
      // Content and close tag are on the same line
      const content = restOfLine.replace(/<\/div>\s*$/, '')
      lines[idx] =
        `${indent}<Stack${beforeClass}${remainingClass}${stackProps}${afterClass}>${content}</Stack>`
      changed = true
    } else {
      // Close tag is on a later line — handled by tag-pairing pass
      lines[idx] =
        `${indent}<Stack${beforeClass}${remainingClass}${stackProps}${afterClass}>${restOfLine}`
      stackLines.add(lineNum)
    }
    changed = true
  }

  let result = lines.join('\n')

  // Replace </div> with </Stack> using tag-pairing on the full string
  if (stackLines.size > 0) {
    // Collect all <div>, <Stack> opens (non-self-closing) and </div> closes
    const tagRegex = /<\/?div\b[^>]*\/?>|<\/?Stack\b[^>]*\/?>/g
    const tags: Array<{ type: 'open' | 'close'; index: number; length: number; isStack: boolean }> =
      []
    let match
    while ((match = tagRegex.exec(result)) !== null) {
      const tag = match[0]
      if (tag.startsWith('</')) {
        tags.push({ type: 'close', index: match.index, length: tag.length, isStack: false })
      } else if (!tag.endsWith('/>')) {
        tags.push({
          type: 'open',
          index: match.index,
          length: tag.length,
          isStack: tag.startsWith('<Stack'),
        })
      }
    }

    // Pair closes to opens on a stack; replace close if open was a Stack
    const openStack: boolean[] = [] // true = Stack, false = div
    const replacements: Array<{ index: number; length: number }> = []
    for (const tag of tags) {
      if (tag.type === 'open') {
        openStack.push(tag.isStack)
      } else {
        const isStack = openStack.pop()
        if (isStack) {
          replacements.push({ index: tag.index, length: tag.length })
        }
      }
    }

    // Apply in reverse (preserving indices)
    for (const r of replacements.reverse()) {
      result = result.slice(0, r.index) + '</Stack>' + result.slice(r.index + r.length)
    }
  }

  if (!changed) return null

  // Add import using shared utilities
  result = ensureImports(result, [{ name: 'Stack', path: '@/components/ui/stack' }])

  return result
}

async function main() {
  const audit: Audit = JSON.parse(await Bun.stdin.text())
  const write = process.argv.includes('--write')
  let modifiedCount = 0

  for (const file of audit.files) {
    const result = migrateFile(file)
    if (result === null) continue

    modifiedCount++
    if (write) {
      if (typeof result !== 'string') {
        console.error(`  ✗ ${file.path}: result is ${typeof result}, not a string`)
        continue
      }
      Bun.write(file.path, result)
      console.error(`  ✓ ${file.path}`)
    } else {
      // Show what would change
      const violations = file.violations.filter((v) => v.rule === 'raw-stack').length
      console.error(`  ~ ${file.path} (${violations} violations)`)
    }
  }

  if (write) {
    console.error(`\nModified ${modifiedCount} files`)
  } else {
    console.error(`\nWould modify ${modifiedCount} files (pass --write to apply)`)
  }
}

main()
