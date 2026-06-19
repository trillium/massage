/**
 * check-file-length.ts
 *
 * Blocks pushes when any .ts/.tsx file modified in the outgoing commits
 * exceeds 250 lines. Files you didn't touch are exempt — they're existing
 * debt tracked elsewhere. Touch a file, own its size.
 *
 * Usage (called by pre-push hook):
 *   bun scripts/check-file-length.ts [remote_sha] [local_sha]
 *
 * Exit code 1 if any modified file exceeds the limit.
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFileSync } from 'node:fs'

const LIMIT = 250

const EXEMPT = [
  /database\.types\.ts$/, // generated
  /\.test\.(ts|tsx)$/, // tests
  /\.next\.test\.(ts|tsx)$/, // next-specific tests
  /\/scripts\//, // one-shot migration scripts
  /\/og-variants\//, // OG image templates (SVG-heavy)
  /app\/design-system\/page\.tsx$/, // component showcase — grows with every new component
  /components\/ui\/manifest\.ts$/, // DS rule registry — grows with every new component
]

function isExempt(file: string): boolean {
  return EXEMPT.some((rx) => rx.test(file))
}

function countLines(file: string): number {
  try {
    return readFileSync(file, 'utf-8').split('\n').length
  } catch {
    return 0
  }
}

function getChangedFiles(remoteSha: string, localSha: string): string[] {
  const range =
    remoteSha === '0'.repeat(40)
      ? `${localSha}` // new branch — check all files in this commit
      : `${remoteSha}..${localSha}`
  try {
    return execSync(`git diff --name-only ${range} -- '*.ts' '*.tsx'`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean)
  } catch {
    return []
  }
}

const [remoteSha, localSha] = process.argv.slice(2)

function getChangedFilesStandalone(): string[] {
  // Standalone mode: diff against the remote tracking branch or origin/main
  const base = execSync(
    'git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo origin/main',
    {
      encoding: 'utf-8',
    }
  ).trim()
  try {
    return execSync(`git diff --name-only ${base}..HEAD -- '*.ts' '*.tsx'`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(Boolean)
  } catch {
    return []
  }
}

const changed =
  remoteSha && localSha ? getChangedFiles(remoteSha, localSha) : getChangedFilesStandalone()
const violations: Array<{ file: string; lines: number }> = []

for (const file of changed) {
  if (!existsSync(file)) continue // deleted files are fine
  if (isExempt(file)) continue
  const lines = countLines(file)
  if (lines > LIMIT) {
    violations.push({ file, lines })
  }
}

if (violations.length === 0) {
  process.exit(0)
}

console.error('\n❌ FILE LENGTH VIOLATION — push blocked\n')
console.error(`Files you modified that exceed ${LIMIT} lines must be refactored before pushing.\n`)
for (const { file, lines } of violations.sort((a, b) => b.lines - a.lines)) {
  console.error(`  ${lines.toString().padStart(4)} lines  ${file}`)
}
console.error('\nHow to fix: https://docs.fallow.tools/explanations/health#unit-size')
console.error('Exempt: *.test.ts, database.types.ts, scripts/, og-variants/\n')
process.exit(1)
