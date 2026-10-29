import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

interface Redirect {
  source: string
  destination: string
}

const EXPIRED_PROMO_PATHS = ['/nerdstage-upgrade-2026-04']

const redirects: Redirect[] = readFileSync(join(process.cwd(), 'redirects.jsonl'), 'utf-8')
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line))

const sourceToRegExp = (source: string) =>
  new RegExp(`^${source.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:\w+/g, '[^/]+')}/?$`)

const isLiteral = (source: string) => !/[:*]/.test(source)

describe('redirects.jsonl', () => {
  it('has no rule shadowed by an earlier rule', () => {
    const shadowed = redirects.flatMap((rule, index) => {
      if (!isLiteral(rule.source)) return []
      const shadowing = redirects
        .slice(0, index)
        .find((earlier) => sourceToRegExp(earlier.source).test(rule.source))
      return shadowing ? [`${rule.source} shadowed by ${shadowing.source}`] : []
    })
    expect(shadowed).toEqual([])
  })

  it('does not point at expired promo pages', () => {
    const expired = redirects.filter(({ destination }) =>
      EXPIRED_PROMO_PATHS.some((path) => destination.includes(path))
    )
    expect(expired).toEqual([])
  })
})
