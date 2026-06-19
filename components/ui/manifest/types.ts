/* ds-ignore-file */
export interface DsRulePattern {
  jsx?: RegExp
  className?: RegExp
  jsxStyle?: { element: RegExp; styling: RegExp }
}

export type DsRuleCategory = 'interactive' | 'layout' | 'typography' | 'feedback' | 'navigation'

export interface DsRule {
  name: string
  component: string
  importPath: string
  category: DsRuleCategory
  selfExempt?: boolean
  noEscapeHatch?: boolean
  hint?: string
  patterns: DsRulePattern[]
  description: string
  rawPattern: string
}

export const DS_COMPONENTS_BY_CATEGORY = {
  interactive: ['Button', 'Input', 'Textarea', 'Select', 'Radio', 'PeerRadio'] as const,
  typography: [
    'TextBase',
    'TextBaseMuted',
    'TextBaseMedium',
    'TextBaseSemibold',
    'TextSm',
    'TextSmMuted',
    'TextSmMedium',
    'TextSmSemibold',
    'TextXs',
    'TextXsMuted',
    'TextXsMedium',
    'TextLg',
    'TextLgMuted',
    'TextMuted',
    'TextPrimary',
    'Caption',
    'LabelSm',
    'GradientText',
  ] as const,
  heading: ['H1', 'H1Hero', 'H2', 'H3', 'H4', 'H5', 'H6'] as const,
  display: ['Code', 'Badge'] as const,
  layout: ['Box', 'Stack'] as const,
  navigation: ['Link'] as const,
} as const

export const DS_COMPONENT_NAMES = Object.values(
  DS_COMPONENTS_BY_CATEGORY
).flat() as readonly string[] as unknown as readonly (typeof DS_COMPONENTS_BY_CATEGORY)[keyof typeof DS_COMPONENTS_BY_CATEGORY][number][]

export type DsComponentName = (typeof DS_COMPONENT_NAMES)[number]
