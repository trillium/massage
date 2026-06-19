/* ds-ignore-file */
import type { DsRule } from '../types'

export const INTERACTIVE_RULES: DsRule[] = [
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
    name: 'raw-select',
    component: '<Select>',
    importPath: '@/components/ui/select',
    category: 'interactive',
    selfExempt: true,
    patterns: [{ jsx: /<select\b/ }],
    rawPattern: '<select …>',
    description: 'Themed select with label, error state, and consistent focus ring',
  },
  {
    name: 'peer-radio',
    component: '<PeerRadio>',
    importPath: '@/components/ui/peer-radio',
    category: 'interactive',
    selfExempt: true,
    patterns: [],
    rawPattern: '<PeerRadio …>',
    description:
      'Bare radio input for CSS peer patterns (sr-only hidden inputs that drive :peer-checked states on sibling labels). No wrapper div. Use <Radio> for visible labeled radios.',
  },
  {
    name: 'raw-radio',
    component: '<Radio> or <PeerRadio>',
    importPath: '@/components/ui/radio',
    category: 'interactive',
    selfExempt: true,
    patterns: [{ jsx: /<input\b[^>]*\btype="radio"\b/ }],
    rawPattern: '<input type="radio" …>',
    description:
      'Use <Radio label="…"> for visible labeled radio buttons. Use <PeerRadio className="peer sr-only"> when the input drives CSS peer-checked states on sibling labels (DurationPicker, DayButton, carousel dots). Never use bare <input type="radio"> — it bypasses the DS wrapper and can cause layout overflow.',
  },
]
