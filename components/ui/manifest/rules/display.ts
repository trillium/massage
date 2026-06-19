/* ds-ignore-file */
import type { DsRule } from '../types'

export const DISPLAY_RULES: DsRule[] = [
  {
    name: 'raw-badge',
    component: '<Badge>',
    importPath: '@/components/ui/badge',
    category: 'typography',
    selfExempt: true,
    patterns: [{ jsx: /<span\b[^>]*badge/ }],
    rawPattern: '<span className=…badge…>',
    description: 'Pill badge — variants: default, secondary, outline, destructive',
  },
  {
    name: 'raw-gradient-text',
    component: '<GradientText>',
    importPath: '@/components/ui/GradientText',
    category: 'typography',
    selfExempt: true,
    patterns: [
      {
        className: /\bbg-clip-text\b.*\btext-transparent\b|\btext-transparent\b.*\bbg-clip-text\b/,
      },
    ],
    rawPattern: 'bg-clip-text text-transparent bg-gradient-to-*',
    description: 'Gradient-clipped text span for headline emphasis words',
  },
  {
    name: 'raw-code',
    component: '<Code>',
    importPath: '@/components/ui/code',
    category: 'typography',
    selfExempt: true,
    patterns: [{ jsx: /<code\b/ }],
    rawPattern: '<code …>',
    description: 'Inline or block code with monospace styling',
  },
]
