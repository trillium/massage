/* ds-ignore-file */
import type { DsRule } from '../types'

export const HEADING_RULES: DsRule[] = [
  {
    name: 'raw-heading',
    component: 'H1 / H1Hero / H2 / H3 / H4',
    importPath: '@/components/ui/heading',
    category: 'typography',
    selfExempt: true,
    patterns: [{ jsx: /<h[1-6]\b/ }],
    rawPattern: '<h1>…<h6> …>',
    description: 'Semantic heading — use the named H1/H2/H3/H4/H1Hero component',
  },
]
