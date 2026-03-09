import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const QR_DIR = path.join(__dirname, '..', '..', 'print', 'qr')

interface VerifyResult {
  scope: string
  total: number
  unique: number
  duplicates: Array<{ slug: string; duplicateOf: string }>
  empty: string[]
  passed: boolean
}

export function verifySvgs(scope: string): VerifyResult {
  const files = fs
    .readdirSync(QR_DIR)
    .filter((f) => f.startsWith(`${scope}_`) && f.endsWith('.svg'))
    .sort()

  const hashes = new Map<string, string>()
  const duplicates: VerifyResult['duplicates'] = []
  const empty: string[] = []

  for (const file of files) {
    const slug = file.replace('.svg', '')
    const content = fs.readFileSync(path.join(QR_DIR, file), 'utf-8')

    if (content.trim().length === 0) {
      empty.push(slug)
      continue
    }

    const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16)
    const existing = hashes.get(hash)
    if (existing) {
      duplicates.push({ slug, duplicateOf: existing })
    } else {
      hashes.set(hash, slug)
    }
  }

  return {
    scope,
    total: files.length,
    unique: hashes.size,
    duplicates,
    empty,
    passed: duplicates.length === 0 && empty.length === 0,
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const scope = process.argv[2]
  if (!scope) {
    console.error('Usage: pnpm tsx lib/qr/verify.ts <scope>')
    console.error('Example: pnpm tsx lib/qr/verify.ts BC01')
    process.exit(1)
  }

  const result = verifySvgs(scope)
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.passed ? 0 : 1)
}
