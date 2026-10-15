import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import baseline from './legacy-redirect-sources.json'

const EXPLICITLY_ALLOWED_NEW_LEGACY_SOURCES: string[] = []

const REDIRECTS_PATH = path.join(__dirname, '..', '..', '..', 'redirects.jsonl')

function readSources(): string[] {
  return fs
    .readFileSync(REDIRECTS_PATH, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line).source as string)
}

describe('redirects.jsonl is frozen as legacy-only', () => {
  it('has no /redirect rules beyond the frozen baseline', () => {
    const known = new Set([...baseline, ...EXPLICITLY_ALLOWED_NEW_LEGACY_SOURCES])
    const added = readSources().filter((source) => !known.has(source))
    expect(added, 'new QR codes belong on /rd (lib/qr/scope-defaults.ts)').toEqual([])
  })

  it('keeps every printed literal /redirect rule resolving', () => {
    const present = new Set(readSources())
    const dropped = baseline.filter((source) => !source.includes(':') && !present.has(source))
    expect(dropped).toEqual([])
  })
})
