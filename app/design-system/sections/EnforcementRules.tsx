/* ds-ignore-file */ /* content-ok-file */
import { Badge } from '@/components/ui/badge'
import { DS_RULES, type DsRuleCategory } from '@/components/ui/manifest'
import { Section } from './shared'

type EnforcementRow = {
  rule: string
  fix: string
  guard: string
  category: DsRuleCategory | 'content'
}

const MANIFEST_RULES: EnforcementRow[] = DS_RULES.map((r) => ({
  rule: r.rawPattern,
  fix: `${r.component} from ${r.importPath}`,
  guard: 'check-design-system.ts + audit-ui.ts (manifest)',
  category: r.category,
}))

const NON_MANIFEST_RULES: EnforcementRow[] = [
  {
    rule: 'Bare JSX text node',
    fix: 'Move string to data/*.json, import via @/data',
    guard: 'lint-content.sh',
    category: 'content',
  },
  {
    rule: '@/data import in brand/OG file',
    fix: 'Brand files own their strings — remove the import',
    guard: 'check-brand-purity.ts',
    category: 'content',
  },
]

const CATEGORY_ORDER: ReadonlyArray<EnforcementRow['category']> = [
  'layout',
  'typography',
  'interactive',
  'feedback',
  'navigation',
  'content',
]

const CATEGORY_LABELS: Record<EnforcementRow['category'], string> = {
  layout: 'Layout',
  typography: 'Typography',
  interactive: 'Interactive',
  feedback: 'Feedback',
  navigation: 'Navigation',
  content: 'Content',
}

const ENFORCEMENT_RULES: EnforcementRow[] = [...MANIFEST_RULES, ...NON_MANIFEST_RULES].sort(
  (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
)

export function EnforcementRules() {
  return (
    <Section title="Enforcement Rules (pre-commit)">
      <div className="overflow-hidden rounded-lg border border-accent-200 dark:border-accent-700">
        <table className="w-full text-sm">
          <thead className="bg-surface-100 dark:bg-surface-800">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-accent-700 dark:text-accent-300">
                Category
              </th>
              <th className="px-4 py-2 text-left font-semibold text-accent-700 dark:text-accent-300">
                Pattern blocked
              </th>
              <th className="px-4 py-2 text-left font-semibold text-accent-700 dark:text-accent-300">
                Use instead
              </th>
              <th className="px-4 py-2 text-left font-semibold text-accent-700 dark:text-accent-300">
                Guard
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent-100 dark:divide-accent-800">
            {ENFORCEMENT_RULES.map(({ rule, fix, guard, category }) => (
              <tr key={rule} className="hover:bg-surface-50 dark:hover:bg-surface-900">
                <td className="px-4 py-2">
                  <Badge variant="outline">{CATEGORY_LABELS[category]}</Badge>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-primary-600 dark:text-primary-400">
                  {rule}
                </td>
                <td className="px-4 py-2 text-accent-700 dark:text-accent-300">{fix}</td>
                <td className="px-4 py-2 font-mono text-xs text-accent-400">{guard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
