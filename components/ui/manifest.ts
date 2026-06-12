/* ds-ignore-file */
export interface DsRulePattern {
  jsx?: RegExp
  className?: RegExp
}

export interface DsRule {
  name: string
  component: string
  importPath: string
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
    selfExempt: true,
    patterns: [{ jsx: /<input\b/ }],
    rawPattern: '<input …>',
    description: 'Labeled input with error state and themed focus ring',
  },
  {
    name: 'raw-textarea',
    component: '<Textarea>',
    importPath: '@/components/ui/textarea',
    selfExempt: true,
    patterns: [{ jsx: /<textarea\b/ }],
    rawPattern: '<textarea …>',
    description: 'Labeled textarea with error state and themed focus ring',
  },
  {
    name: 'raw-button',
    component: '<Button>',
    importPath: '@/components/ui/button',
    selfExempt: true,
    patterns: [{ jsx: /<button\b/ }],
    rawPattern: '<button …>',
    description: 'Themed button — variants: default, secondary, outline, ghost, destructive',
  },
  {
    name: 'raw-badge',
    component: '<Badge>',
    importPath: '@/components/ui/badge',
    selfExempt: true,
    patterns: [{ jsx: /<span\b[^>]*badge/ }],
    rawPattern: '<span className=…badge…>',
    description: 'Pill badge — variants: default, secondary, outline, destructive',
  },
  {
    name: 'raw-gradient-text',
    component: '<GradientText>',
    importPath: '@/components/ui/GradientText',
    selfExempt: true,
    patterns: [
      {
        className: /\bbg-clip-text\b.*\btext-transparent\b|\btext-transparent\b.*\bbg-clip-text\b/,
      },
    ],
    rawPattern: 'bg-clip-text text-transparent bg-gradient-to-*',
    description: 'Gradient-clipped text span for headline emphasis words',
  },
]
