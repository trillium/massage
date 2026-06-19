/* ds-ignore-file */
import type { DsRule } from '../types'

export const LAYOUT_RULES: DsRule[] = [
  {
    name: 'raw-div',
    component: '<Box> or <Stack>',
    importPath: '@/components/ui/box',
    category: 'layout',
    selfExempt: true,
    patterns: [{ jsx: /<div\b/ }],
    rawPattern: '<div …>',
    description: 'Generic container (Box) or flex layout wrapper (Stack)',
  },
  {
    name: 'raw-stack',
    component: '<Stack>',
    importPath: '@/components/ui/stack',
    category: 'layout',
    selfExempt: true,
    patterns: [
      {
        jsx: /<div\b[^>]*\b(?<!inline-)(?<!sm:)(?<!md:)(?<!lg:)(?<!xl:)(?:flex(?!-)|flex-(?:row|col|wrap|nowrap|wrap-reverse|row-reverse|col-reverse))\b/,
      },
    ],
    rawPattern: '<div className="flex …">',
    description: 'Flex row or column layout with gap, align, justify props',
  },
]
