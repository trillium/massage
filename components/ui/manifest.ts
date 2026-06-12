/* ds-ignore-file */
export interface DsRulePattern {
  jsx?: RegExp
  className?: RegExp
}

export type DsRuleCategory = 'interactive' | 'layout' | 'typography' | 'feedback' | 'navigation'

export interface DsRule {
  name: string
  component: string
  importPath: string
  category: DsRuleCategory
  selfExempt?: boolean
  patterns: DsRulePattern[]
  description: string
  rawPattern: string
}

export const DS_RULES: DsRule[] = [
  {
    name: 'raw-input',
    component: '<Input>',
    importPath: '@/components/ui/input',
    category: 'interactive',
    selfExempt: true,
    patterns: [{ jsx: /<input\b/ }],
    rawPattern: '<input …>',
    description: 'Labeled input with error state and themed focus ring',
  },
  {
    name: 'raw-textarea',
    component: '<Textarea>',
    importPath: '@/components/ui/textarea',
    category: 'interactive',
    selfExempt: true,
    patterns: [{ jsx: /<textarea\b/ }],
    rawPattern: '<textarea …>',
    description: 'Labeled textarea with error state and themed focus ring',
  },
  {
    name: 'raw-button',
    component: '<Button>',
    importPath: '@/components/ui/button',
    category: 'interactive',
    selfExempt: true,
    patterns: [{ jsx: /<button\b/ }],
    rawPattern: '<button …>',
    description: 'Themed button — variants: default, secondary, outline, ghost, destructive',
  },
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
    name: 'raw-p',
    component:
      'TextBase / TextSm / TextXs / TextLg / TextMuted (and *Muted/*Medium/*Bold variants)',
    importPath: '@/components/ui/text',
    category: 'typography',
    selfExempt: true,
    patterns: [{ jsx: /<p\b/ }],
    rawPattern: '<p …>',
    description: 'Paragraph text — use the named size/weight component instead of a bare <p>',
  },
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
  {
    name: 'raw-span',
    component: 'TextSm / TextXs / TextBase / Caption',
    importPath: '@/components/ui/text',
    category: 'typography',
    selfExempt: true,
    patterns: [{ jsx: /<span\b[^>]*className=[^>]*text-(?:xs|sm|base|lg|xl)/ }],
    rawPattern: '<span className="text-…">',
    description: 'Inline text with size class — use named text component instead',
  },
  {
    name: 'raw-label',
    component: 'LabelSm',
    importPath: '@/components/ui/label',
    category: 'typography',
    selfExempt: true,
    patterns: [
      { jsx: /<(?:p|span|div)\b[^>]*className=[^>]*text-xs\b[^>]*font-medium\b[^>]*tracking-wide/ },
    ],
    rawPattern: '<p className="text-xs font-medium tracking-wide">',
    description: 'Small label-style text — use LabelSm instead',
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
  {
    name: 'raw-stack',
    component: '<Stack>',
    importPath: '@/components/ui/stack',
    category: 'layout',
    selfExempt: true,
    patterns: [{ jsx: /<div\b[^>]*\bflex\b/ }],
    rawPattern: '<div className="flex …">',
    description: 'Flex row or column layout with gap, align, justify props',
  },
]
