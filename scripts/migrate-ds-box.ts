#!/usr/bin/env bun
/**
 * Codemod: migrate bare <div> → <Box>
 *
 * Replaces bare <div> (no attributes, no className) with <Box>,
 * and bare </div> with </Box>. Only converts when the matching
 * open div is bare — non-bare divs (with attributes) are left alone.
 *
 * Handles:
 *   - Single-line bare opens: <div>
 *   - Self-closing: <div/> <div />
 *   - Mixed files (bare + non-bare divs in same file) via tag-stack tracking
 *
 * Usage:
 *   bun run scripts/audit-ui.ts | bun scripts/migrate-ds-box.ts [--write]
 */

interface Violation {
  line: number
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

import { readFileSync, writeFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { ensureImports } from './lib/imports'

const REPO_ROOT = process.cwd()
const args = process.argv.slice(2)
const shouldWrite = args.includes('--write')

// Read audit from stdin
let auditData = ''
process.stdin.on('data', (chunk) => (auditData += chunk))
process.stdin.on('end', () => {
  const audit: Audit = JSON.parse(auditData)

  // Collect files with raw-div violations
  const filesToProcess = new Set<string>()
  for (const f of audit.files) {
    for (const v of f.violations) {
      if (v.rule === 'raw-div') {
        filesToProcess.add(f.path)
      }
    }
  }
  const fileList = [...filesToProcess].sort()

  let totalReplaced = 0
  let totalFiles = 0

  for (const file of fileList) {
    const absPath = resolve(REPO_ROOT, file)
    const source = readFileSync(absPath, 'utf8')
    const result = migrateFile(source)
    if (result.changed) {
      totalFiles++
      totalReplaced += result.count
      if (shouldWrite) {
        writeFileSync(absPath, result.content)
      } else {
        console.log(`  ${file} — ${result.count} bare <div> → <Box>`)
      }
    }
  }

  console.log(
    `\n${shouldWrite ? 'Wrote' : 'Would write'} ${totalReplaced} replacements across ${totalFiles} files.`
  )
  if (!shouldWrite) {
    console.log('Pass --write to apply changes.')
  }
})

function migrateFile(source: string): { changed: boolean; count: number; content: string } {
  // Strategy: scan through the content tracking tag positions,
  // then rebuild with replacements applied from right-to-left
  // so positions don't shift.

  type TagInfo = {
    start: number
    end: number
    kind: 'bare-open' | 'non-bare-open' | 'close' | 'bare-selfclose' | 'non-bare-selfclose'
    replaceWith?: string
  }

  const tags: TagInfo[] = []
  const re = /<\/?div\b[^>]*>/g
  let match: RegExpExecArray | null

  // Pass 1: find all div tags and classify them
  while ((match = re.exec(source)) !== null) {
    const tag = match[0]
    const start = match.index
    const end = start + tag.length

    if (tag.startsWith('</div>')) {
      tags.push({ start, end, kind: 'close' })
    } else if (tag === '<div>' || tag === '<div >') {
      tags.push({ start, end, kind: 'bare-open' })
    } else if (tag === '<div/>' || tag === '<div />') {
      tags.push({ start, end, kind: 'bare-selfclose' })
    } else if (tag.endsWith('/>') && /^<div[\s>]/.test(tag)) {
      // Self-closing with attributes — doesn't affect the stack
      tags.push({ start, end, kind: 'non-bare-selfclose' })
    } else if (/^<div[\s>]/.test(tag)) {
      // Has attributes — non-bare open
      tags.push({ start, end, kind: 'non-bare-open' })
    } else {
      tags.push({ start, end, kind: 'non-bare-open' })
    }
  }

  // Pass 2: pair closes with opens using a stack, mark bare ones for replacement
  const stack: TagInfo[] = []
  for (const tag of tags) {
    if (tag.kind === 'bare-open' || tag.kind === 'non-bare-open') {
      stack.push(tag)
    } else if (tag.kind === 'close') {
      const open = stack.pop()
      if (open && open.kind === 'bare-open') {
        tag.replaceWith = '</Box>'
      }
    }
    // self-closing tags don't affect the stack
  }

  // Pass 3: mark bare opens and self-closing for replacement
  for (const tag of tags) {
    if (tag.kind === 'bare-open') {
      tag.replaceWith = '<Box>'
    } else if (tag.kind === 'bare-selfclose') {
      tag.replaceWith = '<Box />'
    }
  }

  const toReplace = tags.filter((t) => t.replaceWith)
  if (toReplace.length === 0) {
    return { changed: false, count: 0, content: source }
  }

  // Pass 4: rebuild content right-to-left
  const parts: string[] = []
  let lastEnd = source.length

  for (let i = toReplace.length - 1; i >= 0; i--) {
    const tag = toReplace[i]
    parts.unshift(source.slice(tag.end, lastEnd))
    parts.unshift(tag.replaceWith!)
    lastEnd = tag.start
  }
  parts.unshift(source.slice(0, lastEnd))

  const result = parts.join('')
  const final = ensureImports(result, [{ name: 'Box', path: '@/components/ui/box' }])

  return { changed: true, count: toReplace.length, content: final }
}
