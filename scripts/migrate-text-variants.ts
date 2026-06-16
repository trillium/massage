#!/usr/bin/env bun
/**
 * migrate-text-variants.ts — codemod that rewrites <p|span|h1..h4> elements
 * carrying Tailwind text-style classes into the canonical named text/heading
 * components.
 *
 * Example:
 *   <p className="text-sm font-bold mt-4">Hi</p>
 *   →
 *   <TextSmBold className="mt-4">Hi</TextSmBold>
 *
 * The codemod:
 *   1. Parses each className into text-style vs layout classes
 *   2. Maps text classes → component name via a lookup table
 *   3. Maps color classes → status prop
 *   4. Replaces opening/closing tags, keeps only layout classes
 *   5. Injects imports from @/components/ui/text or @/components/ui/heading
 *   6. Flags ambiguous remainders with a `// ds-review` comment
 *
 * Usage:
 *   bun scripts/migrate-text-variants.ts --dry-run                 # report only
 *   bun scripts/migrate-text-variants.ts                           # apply
 *   bun scripts/migrate-text-variants.ts --file path/to/file.tsx   # single file
 *
 * Skips:
 *   - components/ui/**
 *   - **\/*.test.tsx, **\/*.spec.tsx
 *   - files with a leading /* ds-ignore-file *\/ marker
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { ensureImports } from './lib/imports'

const REPO_ROOT = process.cwd()
const DS_IGNORE_FILE = /\/\*\s*ds-ignore-file\s*\*\//
const SKIP_DIRS = new Set(['.next', 'node_modules', '.contentlayer', 'coverage', '.claude', '.git'])
const SCAN_ROOTS = ['app', 'components']

const TEXT_IMPORT_PATH = '@/components/ui/text'
const HEADING_IMPORT_PATH = '@/components/ui/heading'

type Status = 'muted' | 'primary' | 'success' | 'error' | 'warning' | 'info' | null

interface MappingResult {
  componentName: string
  importPath: string
  status: Status
}

const TEXT_STYLE_PATTERNS: RegExp[] = [
  /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/,
  /^font-(thin|light|normal|medium|semibold|bold|extrabold|black)$/,
  /^text-(accent|primary|secondary|surface)-\d+$/,
  /^dark:text-(accent|primary|secondary|surface)-\d+$/,
  /^text-(red|green|blue|yellow|orange|purple|pink)-\d+$/,
  /^dark:text-(red|green|blue|yellow|orange|purple|pink)-\d+$/,
  /^text-(white|black|transparent)$/,
  /^tracking-(tighter|tight|normal|wide|wider|widest)$/,
  /^leading-(none|tight|snug|normal|relaxed|loose|\d+)$/,
  /^(italic|not-italic)$/,
]

function isTextStyleClass(cls: string): boolean {
  return TEXT_STYLE_PATTERNS.some((rx) => rx.test(cls))
}

interface PartitionedClasses {
  textStyle: string[]
  layout: string[]
}

function partitionClasses(className: string): PartitionedClasses {
  const tokens = className.split(/\s+/).filter(Boolean)
  const textStyle: string[] = []
  const layout: string[] = []
  for (const t of tokens) {
    if (isTextStyleClass(t)) textStyle.push(t)
    else layout.push(t)
  }
  return { textStyle, layout }
}

function statusFromClasses(classes: string[]): Status {
  const has = (rx: RegExp) => classes.some((c) => rx.test(c))
  if (has(/^text-red-/) || has(/^dark:text-red-/)) return 'error'
  if (has(/^text-green-/) || has(/^dark:text-green-/)) return 'success'
  if (has(/^text-yellow-/) || has(/^dark:text-yellow-/)) return 'warning'
  if (has(/^text-blue-/) || has(/^dark:text-blue-/)) return 'info'
  if (has(/^text-primary-/) || has(/^dark:text-primary-/)) return 'primary'
  if (has(/^text-accent-(400|500|600)$/) || has(/^dark:text-accent-(400|500|600)$/)) return 'muted'
  if (has(/^text-surface-/) || has(/^dark:text-surface-/)) return 'muted'
  return null
}

function getSize(classes: string[]): string | null {
  const sizeRx = /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)$/
  for (const c of classes) {
    const m = sizeRx.exec(c)
    if (m) return m[1]
  }
  return null
}

function getWeight(classes: string[]): string | null {
  const weightRx = /^font-(thin|light|normal|medium|semibold|bold|extrabold|black)$/
  for (const c of classes) {
    const m = weightRx.exec(c)
    if (m) return m[1]
  }
  return null
}

function mapHeading(tag: string, classes: string[]): MappingResult | null {
  const size = getSize(classes)
  const weight = getWeight(classes)
  const status = statusFromClasses(classes)

  let componentName: string
  if (tag === 'h1' && size === '4xl' && weight === 'extrabold') componentName = 'H1Hero'
  else if (tag === 'h1') componentName = 'H1'
  else if (tag === 'h2') componentName = 'H2'
  else if (tag === 'h3') componentName = 'H3'
  else if (tag === 'h4') componentName = 'H4'
  else return null

  return { componentName, importPath: HEADING_IMPORT_PATH, status }
}

function mapText(tag: string, classes: string[]): MappingResult | null {
  const size = getSize(classes)
  const weight = getWeight(classes)
  const status = statusFromClasses(classes)

  const hasSurface = classes.some((c) => /^text-surface-/.test(c) || /^dark:text-surface-/.test(c))
  const isTracking = classes.some((c) => /^tracking-/.test(c))
  const labelLike = size === 'xs' && weight === 'medium' && isTracking
  if (labelLike) {
    return { componentName: 'LabelSm', importPath: '@/components/ui/label', status: null }
  }

  if (size === 'xs' && hasSurface && !weight) {
    return { componentName: 'Caption', importPath: TEXT_IMPORT_PATH, status: null }
  }

  const sizeMap: Record<string, string> = {
    xs: 'Xs',
    sm: 'Sm',
    base: 'Base',
    lg: 'Lg',
  }

  if (!size) return null
  const sizeWord = sizeMap[size]
  if (!sizeWord) return null

  let suffix = ''
  if (weight === 'medium') suffix = 'Medium'
  else if (weight === 'semibold') suffix = 'Semibold'
  else if (status === 'muted') suffix = 'Muted'
  else if (status === 'primary' && size === 'sm') {
    return { componentName: 'TextPrimary', importPath: TEXT_IMPORT_PATH, status: null }
  }

  if (status === 'muted' && (weight === 'medium' || weight === 'semibold')) {
    return {
      componentName: `Text${sizeWord}${weight === 'medium' ? 'Medium' : 'Semibold'}`,
      importPath: TEXT_IMPORT_PATH,
      status: 'muted',
    }
  }

  const componentName = `Text${sizeWord}${suffix}`

  const SUPPORTED = new Set([
    'TextBase',
    'TextBaseMuted',
    'TextBaseMedium',
    'TextSm',
    'TextSmMuted',
    'TextSmMedium',
    'TextSmSemibold',
    'TextXs',
    'TextXsMuted',
    'TextXsMedium',
    'TextLg',
    'TextLgMuted',
  ])
  if (!SUPPORTED.has(componentName)) {
    if (suffix === '') {
      return {
        componentName: `Text${sizeWord}`,
        importPath: TEXT_IMPORT_PATH,
        status,
      }
    }
    return null
  }

  const carryStatus: Status = status && status !== 'muted' && status !== 'primary' ? status : null

  return { componentName, importPath: TEXT_IMPORT_PATH, status: carryStatus }
}

interface AttrPart {
  text: string
  className: string | null
  classNameRange: [number, number] | null
}

function parseAttrs(attrs: string): AttrPart {
  const rx = /className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/
  const m = rx.exec(attrs)
  if (!m) return { text: attrs, className: null, classNameRange: null }
  const value = m[1] ?? m[2] ?? m[3]
  return {
    text: attrs,
    className: value ?? null,
    classNameRange: [m.index, m.index + m[0].length],
  }
}

function rebuildClassNameAttr(layout: string[]): string {
  if (layout.length === 0) return ''
  return `className="${layout.join(' ')}"`
}

interface TagMatch {
  fullMatch: string
  tag: string
  attrs: string
  selfClose: boolean
  start: number
  end: number
}

function findOpeningTags(source: string, tags: string[]): TagMatch[] {
  const results: TagMatch[] = []
  const tagAlt = tags.join('|')
  const rx = new RegExp(`<(${tagAlt})(\\s[^>]*?)?(\\s*/)?>`, 'g')
  let m: RegExpExecArray | null
  while ((m = rx.exec(source)) !== null) {
    results.push({
      fullMatch: m[0],
      tag: m[1],
      attrs: m[2] ?? '',
      selfClose: Boolean(m[3]),
      start: m.index,
      end: m.index + m[0].length,
    })
  }
  return results
}

interface ReplacementPlan {
  start: number
  end: number
  replacement: string
  tag: string
  componentName: string
  importPath: string
  hadReviewFlag: boolean
}

function planOpeningReplacement(match: TagMatch): ReplacementPlan | null {
  const attrs = match.attrs
  const parsed = parseAttrs(attrs)
  if (!parsed.className) return null

  const { textStyle, layout } = partitionClasses(parsed.className)
  if (textStyle.length === 0) return null

  const isHeading = /^h[1-4]$/.test(match.tag)
  const mapping = isHeading ? mapHeading(match.tag, textStyle) : mapText(match.tag, textStyle)

  if (!mapping) return null

  const newClassNameAttr = rebuildClassNameAttr(layout)
  const range = parsed.classNameRange!
  let newAttrs = attrs.slice(0, range[0]) + newClassNameAttr + attrs.slice(range[1])
  newAttrs = newAttrs.replace(/\s+/g, ' ').replace(/\s+>/g, '>').replace(/^\s*/, ' ')
  if (newAttrs.trim() === '') newAttrs = ''
  if (newAttrs === ' ') newAttrs = ''

  const statusAttr = mapping.status ? ` status="${mapping.status}"` : ''
  const close = match.selfClose ? ' />' : '>'

  let combinedAttrs = newAttrs + statusAttr
  combinedAttrs = combinedAttrs.replace(/\s{2,}/g, ' ')
  if (combinedAttrs && !combinedAttrs.startsWith(' ')) combinedAttrs = ' ' + combinedAttrs
  if (combinedAttrs === ' ') combinedAttrs = ''

  const replacement = `<${mapping.componentName}${combinedAttrs}${close}`

  const remainingTextStyle = partitionClasses(layout.join(' ')).textStyle
  const hadReviewFlag = remainingTextStyle.length > 0

  return {
    start: match.start,
    end: match.end,
    replacement,
    tag: match.tag,
    componentName: mapping.componentName,
    importPath: mapping.importPath,
    hadReviewFlag,
  }
}

function findClosingTag(source: string, tag: string, fromIndex: number): number {
  const openRx = new RegExp(`<${tag}\\b`, 'g')
  const closeRx = new RegExp(`</${tag}>`, 'g')
  openRx.lastIndex = fromIndex
  closeRx.lastIndex = fromIndex
  let depth = 1
  let cursor = fromIndex
  while (cursor < source.length) {
    openRx.lastIndex = cursor
    closeRx.lastIndex = cursor
    const o = openRx.exec(source)
    const c = closeRx.exec(source)
    if (!c) return -1
    if (o && o.index < c.index) {
      depth++
      cursor = o.index + o[0].length
    } else {
      depth--
      if (depth === 0) return c.index
      cursor = c.index + c[0].length
    }
  }
  return -1
}

interface ProcessResult {
  modified: boolean
  newSource: string
  componentsUsed: Map<string, string>
  reviewLines: number
  replacements: number
  tagCounts: Map<string, number>
}

function processSource(original: string): ProcessResult {
  const result: ProcessResult = {
    modified: false,
    newSource: original,
    componentsUsed: new Map(),
    reviewLines: 0,
    replacements: 0,
    tagCounts: new Map(),
  }

  const targetTags = ['p', 'span', 'h1', 'h2', 'h3', 'h4']
  const matches = findOpeningTags(original, targetTags)

  if (matches.length === 0) return result

  const plans: Array<{
    open: ReplacementPlan
    closeStart: number | null
    closeEnd: number | null
  }> = []

  for (const m of matches) {
    const plan = planOpeningReplacement(m)
    if (!plan) continue
    if (m.selfClose) {
      plans.push({ open: plan, closeStart: null, closeEnd: null })
    } else {
      const closeIdx = findClosingTag(original, m.tag, m.end)
      if (closeIdx === -1) continue
      plans.push({
        open: plan,
        closeStart: closeIdx,
        closeEnd: closeIdx + `</${m.tag}>`.length,
      })
    }
  }

  if (plans.length === 0) return result

  type Edit = {
    start: number
    end: number
    replacement: string
    review: boolean
    componentName: string
    importPath: string
    tag: string
  }
  const edits: Edit[] = []
  for (const p of plans) {
    edits.push({
      start: p.open.start,
      end: p.open.end,
      replacement: p.open.replacement,
      review: p.open.hadReviewFlag,
      componentName: p.open.componentName,
      importPath: p.open.importPath,
      tag: p.open.tag,
    })
    if (p.closeStart !== null && p.closeEnd !== null) {
      edits.push({
        start: p.closeStart,
        end: p.closeEnd,
        replacement: `</${p.open.componentName}>`,
        review: false,
        componentName: p.open.componentName,
        importPath: p.open.importPath,
        tag: p.open.tag,
      })
    }
  }
  edits.sort((a, b) => b.start - a.start)

  let source = original
  for (const e of edits) {
    let replacement = e.replacement
    if (e.review) {
      replacement = `${replacement} {/* ds-review */}`
    }
    source = source.slice(0, e.start) + replacement + source.slice(e.end)
  }

  for (const p of plans) {
    result.componentsUsed.set(p.open.componentName, p.open.importPath)
    result.replacements++
    if (p.open.hadReviewFlag) result.reviewLines++
    const tc = result.tagCounts.get(p.open.tag) ?? 0
    result.tagCounts.set(p.open.tag, tc + 1)
  }

  result.modified = source !== original
  result.newSource = source
  return result
}

function injectImports(source: string, componentsUsed: Map<string, string>): string {
  if (componentsUsed.size === 0) return source
  const entries: Array<{ name: string; path: string }> = []
  for (const [comp, path] of componentsUsed) {
    entries.push({ name: comp, path })
  }
  return ensureImports(source, entries)
}

interface FileReport {
  path: string
  modified: boolean
  replacements: number
  reviewFlags: number
  tagCounts: Map<string, number>
  imports: string[]
}

interface MigrationReport {
  modified: FileReport[]
  skippedIgnore: string[]
  skippedTest: string[]
  totalsByTag: Map<string, number>
  totalReviewFlags: number
}

function parseArgs(argv: string[]): { dryRun: boolean; singleFile: string | null } {
  const dryRun = argv.includes('--dry-run')
  let singleFile: string | null = null
  const fileIdx = argv.indexOf('--file')
  if (fileIdx !== -1 && argv[fileIdx + 1]) singleFile = argv[fileIdx + 1]
  return { dryRun, singleFile }
}

function isTestPath(p: string): boolean {
  return /\.(test|spec)\.tsx?$/.test(p)
}

function isComponentsUiPath(p: string): boolean {
  return p.split(/[\\/]/).join('/').startsWith('components/ui/')
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
      if (stat.isDirectory()) walk(full)
      else if (full.endsWith('.tsx')) results.push(full)
    }
  }
  for (const root of SCAN_ROOTS) {
    const abs = join(REPO_ROOT, root)
    if (existsSync(abs)) walk(abs)
  }
  return results
}

const args = parseArgs(process.argv.slice(2))
const isDryRun = args.dryRun

function processFile(absPath: string): FileReport {
  const relPath = relative(REPO_ROOT, absPath)
  const empty: FileReport = {
    path: relPath,
    modified: false,
    replacements: 0,
    reviewFlags: 0,
    tagCounts: new Map(),
    imports: [],
  }
  if (!existsSync(absPath)) return empty
  const original = readFileSync(absPath, 'utf8')
  if (DS_IGNORE_FILE.test(original)) return empty

  const processed = processSource(original)
  if (!processed.modified) return empty

  const withImports = injectImports(processed.newSource, processed.componentsUsed)

  if (!isDryRun) writeFileSync(absPath, withImports, 'utf8')

  return {
    path: relPath,
    modified: true,
    replacements: processed.replacements,
    reviewFlags: processed.reviewLines,
    tagCounts: processed.tagCounts,
    imports: [...processed.componentsUsed.keys()],
  }
}

function shouldSkipFile(absPath: string): { skip: boolean; reason: 'test' | 'ui' | null } {
  const rel = relative(REPO_ROOT, absPath)
  if (isComponentsUiPath(rel)) return { skip: true, reason: 'ui' }
  if (isTestPath(rel)) return { skip: true, reason: 'test' }
  return { skip: false, reason: null }
}

function run(): MigrationReport {
  const report: MigrationReport = {
    modified: [],
    skippedIgnore: [],
    skippedTest: [],
    totalsByTag: new Map(),
    totalReviewFlags: 0,
  }

  let files: string[]
  if (args.singleFile) {
    const abs = resolve(REPO_ROOT, args.singleFile)
    if (!existsSync(abs)) {
      process.stderr.write(`Error: file not found: ${args.singleFile}\n`)
      process.exit(1)
    }
    files = [abs]
  } else {
    files = collectFiles()
  }

  for (const abs of files) {
    const { skip, reason } = shouldSkipFile(abs)
    const rel = relative(REPO_ROOT, abs)
    if (skip) {
      if (reason === 'test') report.skippedTest.push(rel)
      continue
    }
    if (existsSync(abs)) {
      const source = readFileSync(abs, 'utf8')
      if (DS_IGNORE_FILE.test(source)) {
        report.skippedIgnore.push(rel)
        continue
      }
    }
    const fr = processFile(abs)
    if (fr.modified) {
      report.modified.push(fr)
      for (const [tag, count] of fr.tagCounts) {
        const cur = report.totalsByTag.get(tag) ?? 0
        report.totalsByTag.set(tag, cur + count)
      }
      report.totalReviewFlags += fr.reviewFlags
    }
  }

  return report
}

function formatTagCounts(counts: Map<string, number>): string {
  const order = ['p', 'span', 'h1', 'h2', 'h3', 'h4']
  const parts: string[] = []
  for (const k of order) {
    const v = counts.get(k)
    if (v && v > 0) parts.push(`${k}(${v})`)
  }
  return parts.join(' ')
}

function printReport(report: MigrationReport): void {
  const header = isDryRun
    ? 'Text Variant Migration (DRY RUN — no files written)'
    : 'Text Variant Migration'
  process.stdout.write(`\n${header}\n`)
  process.stdout.write('='.repeat(header.length) + '\n')
  process.stdout.write(`Modified: ${report.modified.length} files\n`)
  process.stdout.write(`Skipped (ds-ignore): ${report.skippedIgnore.length} files\n`)
  process.stdout.write(`Skipped (test): ${report.skippedTest.length} files\n`)
  process.stdout.write(`Substitutions by tag: ${formatTagCounts(report.totalsByTag)}\n`)
  process.stdout.write(`ds-review flags inserted: ${report.totalReviewFlags}\n\n`)

  if (report.modified.length > 0) {
    process.stdout.write('Modified files:\n')
    const sorted = [...report.modified].sort((a, b) => b.replacements - a.replacements)
    for (const f of sorted) {
      const counts = formatTagCounts(f.tagCounts)
      const review = f.reviewFlags > 0 ? ` [⚠ ${f.reviewFlags} ds-review]` : ''
      const imp = f.imports.length > 0 ? ` [+${f.imports.join(', ')}]` : ''
      process.stdout.write(`  ${f.path} — ${counts}${imp}${review}\n`)
    }
    process.stdout.write('\n')
  }
}

const report = run()
printReport(report)
