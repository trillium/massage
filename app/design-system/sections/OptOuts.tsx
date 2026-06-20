/* ds-ignore-file */ /* content-ok-file */
import { Section } from './shared'

const OPT_OUTS = [
  {
    directive: '// ds-ignore',
    scope: 'Single line',
    what: 'Skips design-system component check on that line',
  },
  {
    directive: '/* ds-ignore-file */',
    scope: 'Whole file',
    what: 'Skips all design-system component checks',
  },
  { directive: '// content-ok', scope: 'Single line', what: 'Allows bare JSX text on that line' },
  {
    directive: 'data-content-skip="reason"',
    scope: 'Block',
    what: 'Skips content check for the element',
  },
  { directive: '/* content-ok-file */', scope: 'Whole file', what: 'Skips all content checks' },
]

const BIOME_EXEMPT = [
  'app/api/og/**',
  'app/[bookingSlug]/opengraph-image.tsx',
  'app/[bookingSlug]/designs/**',
  'app/admin/og-preview/**',
  'app/og-preview/**',
  'app/og-variants/**',
  'app/design-system/**',
]

export function OptOuts() {
  return (
    <>
      <Section title="Opt-out Directives">
        <div className="overflow-x-auto rounded-lg border border-accent-200 dark:border-accent-700">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 dark:bg-surface-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-accent-700 dark:text-accent-300">
                  Directive
                </th>
                <th className="px-4 py-2 text-left font-semibold text-accent-700 dark:text-accent-300">
                  Scope
                </th>
                <th className="px-4 py-2 text-left font-semibold text-accent-700 dark:text-accent-300">
                  Effect
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-100 dark:divide-accent-800">
              {OPT_OUTS.map(({ directive, scope, what }) => (
                <tr key={directive} className="hover:bg-surface-50 dark:hover:bg-surface-900">
                  <td className="px-4 py-2 font-mono text-xs text-secondary-600 dark:text-secondary-400">
                    {directive}
                  </td>
                  <td className="px-4 py-2 text-accent-500">{scope}</td>
                  <td className="px-4 py-2 text-accent-700 dark:text-accent-300">{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-md bg-secondary-50 px-4 py-3 text-sm text-secondary-800 dark:bg-secondary-950 dark:text-secondary-200">
          Note: ds-ignore-file and content-ok-file are separate directives. Brand/OG files need
          both.
        </div>
      </Section>

      <Section title="noJsxLiterals Exemptions (biome.json)">
        <p className="mb-3 text-sm text-accent-500">
          These paths are exempt from the noJsxLiterals rule — they own their strings by design.
          check-brand-purity.mjs enforces that they do not import from @/data.
        </p>
        <div className="rounded-lg border border-accent-200 bg-surface-50 p-4 dark:border-accent-700 dark:bg-surface-900">
          {BIOME_EXEMPT.map((path) => (
            <div key={path} className="font-mono text-sm text-accent-600 dark:text-accent-400">
              {path}
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
