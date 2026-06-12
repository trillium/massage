#!/usr/bin/env node
/**
 * check-design-system.mjs — pattern-based guard against raw HTML elements
 * that should use design-system components.
 *
 * Usage (lint-staged passes file paths as argv):
 *   node scripts/check-design-system.mjs <file> [<file> ...]
 *
 * Exit codes:
 *   0  clean
 *   1  one or more files violated a rule
 *
 * Escape hatches:
 *   - `// ds-ignore` on a line — skips that single line
 *   - `/* ds-ignore-file *\/` anywhere in the file — skips the whole file
 */

import { readFileSync, existsSync, statSync } from 'node:fs'
import process from 'node:process'

const RULES = [
  {
    name: 'raw-input',
    pattern: /<input\b[^>]*\bclassName=/,
    component: '<Input>',
    importPath: '@/components/ui/',
  },
  {
    name: 'raw-textarea',
    pattern: /<textarea\b[^>]*\bclassName=/,
    component: '<Textarea>',
    importPath: '@/components/ui/',
  },
  {
    name: 'raw-button',
    pattern: /<button\b[^>]*\bclassName=/,
    component: '<Button>',
    importPath: '@/components/ui/',
  },
  {
    name: 'raw-badge',
    pattern: /<span\b[^>]*badge/,
    component: '<Badge>',
    importPath: '@/components/ui/',
  },
]

const FILE_OPT_OUT = '/* ds-ignore-file */'
const LINE_OPT_OUT = '// ds-ignore'

function isSourceFile(file) {
  return /\.(tsx|ts|jsx|js)$/.test(file)
}

function shouldSkipPath(file) {
  if (file.includes('/node_modules/')) return true
  if (file.includes('/.next/')) return true
  if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) return true
  if (file.endsWith('.spec.ts') || file.endsWith('.spec.tsx')) return true
  if (file.includes('/__tests__/')) return true
  if (file.startsWith('scripts/') || file.includes('/scripts/')) return true
  return false
}

function checkFile(file) {
  if (!existsSync(file)) return []
  try {
    const st = statSync(file)
    if (!st.isFile()) return []
  } catch {
    return []
  }
  const source = readFileSync(file, 'utf8')
  if (source.includes(FILE_OPT_OUT)) return []

  const lines = source.split('\n')
  const findings = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes(LINE_OPT_OUT)) continue
    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          file,
          line: i + 1,
          rule: rule.name,
          component: rule.component,
          importPath: rule.importPath,
          excerpt: line.trim(),
        })
      }
    }
  }
  return findings
}

function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  const files = args.filter(isSourceFile).filter((f) => !shouldSkipPath(f))
  if (files.length === 0) {
    process.exit(0)
  }

  let allFindings = []
  for (const f of files) {
    allFindings = allFindings.concat(checkFile(f))
  }

  if (allFindings.length === 0) {
    process.exit(0)
  }

  process.stderr.write(
    `check-design-system: raw HTML element where a design-system component is expected\n\n`
  )
  for (const f of allFindings) {
    process.stderr.write(
      `  ${f.file}:${f.line}  [${f.rule}] use ${f.component} from ${f.importPath}\n` +
        `      ${f.excerpt}\n\n`
    )
  }
  process.stderr.write(
    `Escape hatch: add \`// ds-ignore\` on the line, or \`/* ds-ignore-file */\` at top of file.\n`
  )
  process.exit(1)
}

main()
