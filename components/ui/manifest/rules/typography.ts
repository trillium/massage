/* ds-ignore-file */
import { DS_COMPONENT_NAMES, type DsRule } from '../types'

export const TYPOGRAPHY_RULES: DsRule[] = [
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
    name: 'raw-span',
    component: 'TextSm / TextXs / TextBase / Caption',
    importPath: '@/components/ui/text',
    category: 'typography',
    selfExempt: true,
    patterns: [{ jsx: /<span\b[^>]*className=/ }],
    rawPattern: '<span className={…}>',
    description:
      'Styled span — use a named text component (TextBase, TextSm, TextXs, Caption, etc.) instead. Raw styled spans bypass the DS type scale.',
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
    name: 'ds-component-style-override',
    component: 'a variant or status prop on the component',
    importPath: '@/components/ui',
    category: 'typography',
    selfExempt: true,
    hint: 'Check manifest.ts for an existing variant/status prop. If none fits, add one to the component — do not use className for styling.',
    patterns: [
      {
        jsxStyle: {
          element: new RegExp(
            `<(?:(?:${DS_COMPONENT_NAMES.filter((n) => !['Box', 'Stack'].includes(n)).join('|')}))\\b`
          ),
          styling:
            /(?<!(?:sm|md|lg|xl):)(?<!2xl:)\b(?:text-(?:primary|secondary|accent|surface|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|slate|zinc|neutral|stone)-\d{2,3}|bg-(?:primary|secondary|accent|surface|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|slate|zinc|neutral|stone)-\d{2,3}|font-(?:bold|semibold|medium|light|thin|extralight|black|extrabold|mono|sans|serif)|text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))\b/,
        },
      },
    ],
    rawPattern: '<Code className="text-primary-600 font-semibold">',
    description:
      'DS component styling belongs in variant/status props — spacing utilities (m-*, p-*, w-*, h-*, gap-*) are allowed in className',
  },
]
