#!/usr/bin/env bun
/**
 * AST-based codemod: migrate <div className="flex ..."|{clsx(...)}> → <Stack>
 *
 * Uses the TypeScript compiler API (already a dep) for proper AST parsing.
 * Handles:
 *   - String-literal className
 *   - clsx() calls with static + dynamic args
 *   - Flex-container vs flex-child detection
 *
 * Usage:
 *   bun scripts/migrate-ds-stack-ast.ts --write [file...]
 *   bun scripts/migrate-ds-stack-ast.ts --dry-run [file...]
 */

import ts from 'typescript'
import * as fs from 'node:fs'

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

// Responsive flex display: sm:flex, md:flex (no direction) → cannot use Stack (always flex)
const respFlexOnly = /^(?:sm|md|lg|xl|xs):flex$/
// Responsive flex direction: sm:flex-row, md:flex-col → OK, Tailwind overrides Stack's static direction
const respFlexDir = /^(?:sm|md|lg|xl|xs):flex-(?:row|col|row-reverse|col-reverse|wrap|nowrap)\b/
const skipPattern = /\b(?:hidden|invisible|sr-only)\b/

function findAttr(
  nodes: ts.NodeArray<ts.JsxAttributeLike>,
  name: string
): ts.JsxAttribute | undefined {
  for (const n of nodes) {
    if (ts.isJsxAttribute(n) && ts.isIdentifier(n.name) && n.name.text === name) return n
  }
}

function getAttrText(attrs: ts.NodeArray<ts.JsxAttributeLike>, skip: ts.JsxAttribute): string {
  let result = ''
  for (const n of attrs) {
    if (n === skip) continue
    if (ts.isJsxAttribute(n) || ts.isJsxSpreadAttribute(n)) {
      result += ' ' + n.getText()
    }
  }
  return result.replace(/^\s+/, '')
}

interface Analysis {
  staticParts: string[]
  dynamics: string[]
}

function analyze(attr: ts.JsxAttribute): Analysis | null {
  if (!attr.initializer) return null
  if (ts.isStringLiteral(attr.initializer))
    return { staticParts: [attr.initializer.text], dynamics: [] }
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const expr = attr.initializer.expression
    if (
      ts.isCallExpression(expr) &&
      ts.isIdentifier(expr.expression) &&
      expr.expression.text === 'clsx'
    )
      return analyzeClsx(expr)
    return { staticParts: [], dynamics: [expr.getText()] }
  }
  return null
}

function analyzeClsx(call: ts.CallExpression): Analysis {
  const staticParts: string[] = []
  const dynamics: string[] = []
  for (const arg of call.arguments) {
    if (ts.isStringLiteral(arg)) {
      staticParts.push(arg.text)
      continue
    }
    if (ts.isObjectLiteralExpression(arg)) {
      const allAlways = arg.properties.every(
        (p) =>
          ts.isPropertyAssignment(p) &&
          p.initializer.kind === ts.SyntaxKind.TrueKeyword
      )
      if (allAlways) {
        for (const p of arg.properties) {
          if (ts.isPropertyAssignment(p) && ts.isStringLiteral(p.name))
            staticParts.push(p.name.text)
        }
      } else {
        dynamics.push(arg.getText())
      }
      continue
    }
    dynamics.push(arg.getText())
  }
  return { staticParts, dynamics }
}

function isFlexContainer(staticParts: string[]): boolean {
  const s = staticParts.join(' ')
  if (/\binline-flex\b/.test(s)) return false
  const childPattern = /\bflex-(?:1|auto|initial|none|grow(?:-\d+)?|shrink(?:-\d+)?)\b/g
  const stripped = s.replace(childPattern, '')
  if (/\bflex\b(?!-)/.test(stripped)) return true
  if (/\bflex-(?:col|row|col-reverse|row-reverse|wrap)\b/.test(s)) return true
  return false
}

function parseClasses(parts: string[]) {
  const tokens = parts.flatMap((s) => s.split(/\s+/).filter(Boolean))
  const props: string[][] = []
  const remaining: string[] = []
  let hadFlex = false
  let hasRespFlexOnly = false

  for (const t of tokens) {
    if (respFlexOnly.test(t)) {
      hasRespFlexOnly = true
      remaining.push(t)
      continue
    }
    if (respFlexDir.test(t)) {
      remaining.push(t)
      continue
    }
    let m = false
    for (const [re, k, v] of classToProp) {
      if (re.test(t)) {
        if (k === 'direction' && v === 'row') {
          hadFlex = true
          m = true
          break
        }
        props.push([k, v])
        m = true
        break
      }
    }
    if (m) continue
    if (t === 'flex') {
      hadFlex = true
      continue
    }
    remaining.push(t)
  }

  if (hadFlex && !props.some(([k]) => k === 'direction')) props.unshift(['direction', 'row'])
  return { props, remaining, hasRespFlexOnly }
}

function fmtProps(props: string[][]): string {
  return props.length
    ? ' ' +
        props
          .map(([k, v]) => (k === 'wrap' ? k : k === 'gap' ? `gap={${v}}` : `${k}="${v}"`))
          .join(' ')
    : ''
}

interface ClassNameResult {
  text: string
  isExpr: boolean
}

function buildClassName(remaining: string[], dynamics: string[]): ClassNameResult | null {
  const s = remaining.filter(Boolean).join(' ')
  const hasS = s.length > 0
  const hasD = dynamics.length > 0
  if (!hasS && !hasD) return null
  if (hasS && !hasD) return { text: s, isExpr: false }
  if (!hasS && hasD) {
    const t = dynamics.length === 1 ? dynamics[0] : `clsx(${dynamics.join(', ')})`
    return { text: t, isExpr: true }
  }
  return { text: `clsx("${s}", ${dynamics.join(', ')})`, isExpr: true }
}

interface Candidate {
  openingStart: number
  openingEnd: number
  stackTag: string
}

function findCandidates(sourceFile: ts.SourceFile, source: string): Candidate[] {
  const out: Candidate[] = []

  function walk(node: ts.Node) {
    const isDiv = (tag: ts.JsxTagNameExpression) => ts.isIdentifier(tag) && tag.text === 'div'

    let el: ts.JsxElement | null = null
    let selfClosing: ts.JsxSelfClosingElement | null = null

    if (ts.isJsxElement(node) && isDiv(node.openingElement.tagName)) el = node
    else if (ts.isJsxSelfClosingElement(node) && isDiv(node.tagName)) selfClosing = node

    if (el) {
      const attr = findAttr(el.openingElement.attributes.properties, 'className')
      const a = attr ? analyze(attr) : null
      if (a) {
        const { props, remaining, hasRespFlexOnly } = parseClasses(a.staticParts)
        if (isFlexContainer(a.staticParts) && !hasRespFlexOnly) {
          const cn = buildClassName(remaining, a.dynamics)
          const extra = getAttrText(el.openingElement.attributes.properties, attr)
          const cnAttr = cn
            ? cn.isExpr
              ? ` className={${cn.text}}`
              : ` className="${cn.text}"`
            : ''
          const tag = `<Stack${fmtProps(props)}${cnAttr}${extra ? ' ' + extra : ''}>`
          out.push({
            openingStart: el.openingElement.getStart(),
            openingEnd: el.openingElement.getEnd(),
            stackTag: tag,
          })
        }
      }
      ts.forEachChild(el, walk)
      return
    }

    if (selfClosing) {
      const attr = findAttr(selfClosing.attributes.properties, 'className')
      const a = attr ? analyze(attr) : null
      if (a) {
        const { props, remaining, hasRespFlexOnly } = parseClasses(a.staticParts)
        if (isFlexContainer(a.staticParts) && !hasRespFlexOnly) {
          const cn = buildClassName(remaining, a.dynamics)
          const extra = getAttrText(selfClosing.attributes.properties, attr)
          const cnAttr = cn
            ? cn.isExpr
              ? ` className={${cn.text}}`
              : ` className="${cn.text}"`
            : ''
          const tag = `<Stack${fmtProps(props)}${cnAttr}${extra ? ' ' + extra : ''} />`
          out.push({
            openingStart: selfClosing.getStart(),
            openingEnd: selfClosing.getEnd(),
            stackTag: tag,
          })
        }
      }
      ts.forEachChild(selfClosing, walk)
      return
    }

    ts.forEachChild(node, walk)
  }

  walk(sourceFile)
  return out
}

function pairClosingTags(result: string): string {
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

  const openStack: boolean[] = []
  const replacements: Array<{ index: number; length: number }> = []
  for (const t of tags) {
    if (t.type === 'open') {
      openStack.push(t.isStack)
    } else {
      const isStack = openStack.pop()
      if (isStack) {
        replacements.push({ index: t.index, length: t.length })
      }
    }
  }

  for (const r of replacements.reverse()) {
    result = result.slice(0, r.index) + '</Stack>' + result.slice(r.index + r.length)
  }
  return result
}

function addStackImport(source: string): string {
  const imp = "import { Stack } from '@/components/ui/stack'"
  if (source.includes(imp)) return source
  const lines = source.split('\n')
  let lastImport = -1
  for (let i = 0; i < lines.length; i++) {
    if (/^import\s/.test(lines[i])) lastImport = i
  }
  if (lastImport === -1) return source
  let insertAt = lastImport + 1
  while (insertAt < lines.length && !/^import\s/.test(lines[insertAt]) && lines[insertAt].trim())
    insertAt++
  lines.splice(insertAt, 0, imp)
  return lines.join('\n')
}

function migrateFile(filePath: string): string | null {
  const source = fs.readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const candidates = findCandidates(sourceFile, source)
  if (candidates.length === 0) return null

  // Apply opening tag replacements in reverse order (preserves positions)
  let result = source
  const sorted = [...candidates].sort((a, b) => b.openingStart - a.openingStart)
  for (const c of sorted) {
    result = result.slice(0, c.openingStart) + c.stackTag + result.slice(c.openingEnd)
  }

  // Pair closing tags using the proven stack algorithm
  result = pairClosingTags(result)

  result = addStackImport(result)
  return result
}

async function main() {
  const args = process.argv.slice(2)
  const write = args.includes('--write')
  const dryRun = args.includes('--dry-run')
  const files = args.filter((a) => !a.startsWith('--') && fs.existsSync(a))

  if (files.length === 0) {
    console.error('Usage: migrate-ds-stack-ast.ts [--write|--dry-run] file1.tsx [file2.tsx ...]')
    process.exit(1)
  }

  let modified = 0
  for (const f of files) {
    const result = migrateFile(f)
    if (result === null) continue
    modified++
    if (write) {
      fs.writeFileSync(f, result)
      console.error(`  ✓ ${f}`)
    } else {
      console.error(`  ~ ${f}`)
    }
  }

  if (modified === 0) {
    console.error('No files modified.')
  } else if (!write && !dryRun) {
    console.error(`\nWould modify ${modified} files (pass --write to apply)`)
  } else if (write) {
    console.error(`\nModified ${modified} files`)
  }
}

main()
