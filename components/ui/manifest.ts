/* ds-ignore-file */
import type { DsRule } from './manifest/types'
import { INTERACTIVE_RULES } from './manifest/rules/interactive'
import { DISPLAY_RULES } from './manifest/rules/display'
import { LAYOUT_RULES } from './manifest/rules/layout'
import { TYPOGRAPHY_RULES } from './manifest/rules/typography'
import { HEADING_RULES } from './manifest/rules/heading'
import { NAVIGATION_RULES } from './manifest/rules/navigation'

export type { DsRulePattern, DsRuleCategory, DsRule, DsComponentName } from './manifest/types'
export { DS_COMPONENTS_BY_CATEGORY, DS_COMPONENT_NAMES } from './manifest/types'

const rulesByName = new Map<string, DsRule>()
for (const rule of [
  ...INTERACTIVE_RULES,
  ...DISPLAY_RULES,
  ...LAYOUT_RULES,
  ...TYPOGRAPHY_RULES,
  ...HEADING_RULES,
  ...NAVIGATION_RULES,
]) {
  rulesByName.set(rule.name, rule)
}

const RULE_ORDER = [
  'raw-input',
  'raw-textarea',
  'raw-button',
  'raw-badge',
  'raw-gradient-text',
  'raw-div',
  'raw-p',
  'raw-heading',
  'raw-span',
  'raw-anchor',
  'raw-label',
  'raw-code',
  'raw-stack',
  'raw-select',
  'peer-radio',
  'raw-radio',
  'ds-component-style-override',
] as const

export const DS_RULES: DsRule[] = RULE_ORDER.map((name) => {
  const rule = rulesByName.get(name)
  if (!rule) {
    throw new Error(`manifest: missing rule "${name}" — check manifest/rules/*.ts exports`)
  }
  return rule
})
