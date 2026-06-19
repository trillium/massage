/* ds-ignore-file */
import type { DsRule } from '../types'

export const NAVIGATION_RULES: DsRule[] = [
  {
    name: 'raw-anchor',
    component: '<Link>',
    importPath: '@/components/Link',
    category: 'navigation',
    selfExempt: true,
    patterns: [{ jsx: /<a\b[^>]*(?:href|className)=/ }],
    rawPattern: '<a href={…}> or <a className={…}>',
    description:
      'Use <Link> from @/components/Link for all navigation links. Bare <a> bypasses Next.js routing, prefetching, and any DS link styling.',
  },
]
