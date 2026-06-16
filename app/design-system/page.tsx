/* ds-ignore-file */ /* content-ok-file */
import SectionContainer from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GradientText } from '@/components/ui/GradientText'
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import {
  TextBase,
  TextBaseMuted,
  TextBaseMedium,
  TextSm,
  TextSmMuted,
  TextSmMedium,
  TextSmSemibold,
  TextXs,
  TextXsMuted,
  TextXsMedium,
  TextLg,
  TextLgMuted,
  TextMuted,
  TextPrimary,
  Caption,
} from '@/components/ui/text'
import { H1, H1Hero, H2, H3, H4 } from '@/components/ui/heading'
import { LabelSm } from '@/components/ui/label'
import { Code } from '@/components/ui/code'
import { DS_RULES, type DsRuleCategory } from '@/components/ui/manifest'

const PALETTE_SCALES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const PALETTES = [
  {
    name: 'primary',
    label: 'Primary (Red)',
    description: 'CTAs, links, focus rings, error states',
  },
  {
    name: 'secondary',
    label: 'Secondary (Gold/Amber)',
    description: 'Gift mode, promo badges, highlights',
  },
  { name: 'surface', label: 'Surface', description: 'Page, card, panel backgrounds' },
  { name: 'accent', label: 'Accent', description: 'Text, borders, dividers, structural neutrals' },
]

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

function Swatch({ palette, scale }: { palette: string; scale: number }) {
  return (
    <Stack direction="col" align="center" gap={1}>
      <div
        className={`h-10 w-10 rounded border border-accent-200 bg-${palette}-${scale} dark:border-accent-700`}
      />
      <span className="text-center font-mono text-[10px] text-accent-500">{scale}</span>
    </Stack>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <H2 className="mb-6 text-xl font-bold tracking-tight text-accent-900 dark:text-accent-100">
        {title}
      </H2>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  return (
    <SectionContainer>
      <div className="mx-auto max-w-5xl py-10">
        <div className="mb-10">
          <H1 className="text-3xl font-bold text-accent-900 dark:text-accent-100">Design System</H1>
          <p className="mt-2 text-sm text-accent-500">
            Token reference, enforcement rules, and opt-out directives for massage.la
          </p>
        </div>

        {/* Color Palettes */}
        <Section title="Color Tokens">
          <div className="space-y-8">
            {PALETTES.map(({ name, label, description }) => (
              <div key={name}>
                <Stack direction="row" gap={3} className="mb-2 items-baseline">
                  <span className="font-semibold text-accent-800 dark:text-accent-200">
                    {label}
                  </span>
                  <span className="text-xs text-accent-400">{description}</span>
                </Stack>
                <Stack direction="row" wrap gap={2}>
                  {PALETTE_SCALES.map((scale) => (
                    <Swatch key={scale} palette={name} scale={scale} />
                  ))}
                </Stack>
                <p className="mt-1 font-mono text-xs text-accent-400">
                  bg-{name}-* / text-{name}-* / border-{name}-*
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography Scale">
          <div className="space-y-3 rounded-lg border border-accent-200 p-6 dark:border-accent-700">
            {[
              ['text-xs', 'Extra small — 12px'],
              ['text-sm', 'Small — 14px'],
              ['text-base', 'Base — 16px'],
              ['text-lg', 'Large — 18px'],
              ['text-xl', 'XL — 20px'],
              ['text-2xl', '2XL — 24px'],
              ['text-3xl', '3XL — 30px'],
              ['text-4xl', '4XL — 36px'],
              ['text-5xl', '5XL — 48px'],
            ].map(([cls, label]) => (
              <Stack direction="row" gap={4} className="items-baseline" key={cls}>
                <span className="w-24 font-mono text-xs text-accent-400">{cls}</span>
                <span className={`${cls} text-accent-900 dark:text-accent-100`}>{label}</span>
              </Stack>
            ))}
          </div>
        </Section>

        {/* Enforcement Rules */}
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

        {/* Opt-outs */}
        <Section title="Opt-out Directives">
          <div className="overflow-hidden rounded-lg border border-accent-200 dark:border-accent-700">
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

        {/* Components */}
        <Section title="Components">
          {/* Button */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Button
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ Button }'} from @/components/ui/button
            </p>
            <Stack
              direction="row"
              wrap
              gap={3}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="default" size="sm">
                Small
              </Button>
              <Button variant="default" size="lg">
                Large
              </Button>
              <Button variant="default" disabled>
                Disabled
              </Button>
            </Stack>
          </div>

          {/* Badge */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Badge
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ Badge }'} from @/components/ui/badge
            </p>
            <Stack
              direction="row"
              wrap
              gap={3}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </Stack>
          </div>

          {/* Input */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Input
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ Input }'} from @/components/ui/input
            </p>
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-accent-200 p-4 dark:border-accent-700 md:grid-cols-2">
              <Input label="Label" placeholder="Placeholder text" />
              <Input label="With error" placeholder="Bad value" error="This field is required" />
              <Input placeholder="No label" />
              <Input placeholder="Disabled" disabled />
            </div>
          </div>

          {/* GradientText */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              GradientText
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ GradientText }'} from @/components/ui/GradientText
            </p>
            <p className="mb-3 text-xs text-accent-500">
              Gradient-clipped text span. Default: accent-700 → primary-700 → primary-500 (bottom).
              Used for hero headline emphasis words (Relax, Restore, Rejuvenate).
            </p>
            <Stack
              direction="col"
              gap={4}
              className="rounded-lg border border-accent-200 p-6 dark:border-accent-700"
            >
              <div className="text-4xl font-bold">
                Relax, <GradientText>Restore</GradientText>, Rejuvenate
              </div>
              <div className="text-2xl font-bold">
                Default gradient: <GradientText>accent → primary</GradientText>
              </div>
              <div className="text-2xl font-bold">
                Custom:{' '}
                <GradientText
                  gradientColors="from-secondary-400 via-secondary-600 to-primary-600"
                  gradientColorsDark="dark:from-secondary-300 dark:via-secondary-500 dark:to-primary-400"
                  gradientDirection="bg-gradient-to-r"
                  directionLevels="from-0% via-50% to-100%"
                >
                  gold → red
                </GradientText>
              </div>
            </Stack>
          </div>

          {/* Textarea */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Textarea
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ Textarea }'} from @/components/ui/textarea
            </p>
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-accent-200 p-4 dark:border-accent-700 md:grid-cols-2">
              <Textarea label="Notes" placeholder="Enter notes..." />
              <Textarea label="With error" placeholder="..." error="Required" />
            </div>
          </div>

          {/* Box */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Box</H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ Box }'} from @/components/ui/box
            </p>
            <p className="mb-3 text-xs text-accent-500">
              Generic container — replaces bare div/section/article/main/aside/nav/header/footer.
            </p>
            <Box className="rounded-lg border border-accent-200 p-4 dark:border-accent-700">
              <Box as="section" className="text-sm text-accent-700 dark:text-accent-300">
                Default Box (div)
              </Box>
              <Box
                as="article"
                className="mt-2 rounded bg-surface-100 p-2 text-sm text-accent-700 dark:bg-surface-800 dark:text-accent-300"
              >
                Box as article
              </Box>
            </Box>
          </div>

          {/* Stack */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Stack
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ Stack }'} from @/components/ui/stack
            </p>
            <p className="mb-3 text-xs text-accent-500">
              Flex layout primitive — direction, gap, align, justify, wrap props.
            </p>
            <Stack
              gap={4}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <Stack direction="row" gap={2} align="center">
                <Badge variant="default">Row</Badge>
                <Badge variant="secondary">gap=2</Badge>
                <Badge variant="outline">align=center</Badge>
              </Stack>
              <Stack direction="row" gap={4} justify="between" align="center">
                <TextSm>justify=between</TextSm>
                <Button variant="outline" size="sm">
                  Action
                </Button>
              </Stack>
              <Stack gap={2}>
                <TextSm>Column stack</TextSm>
                <TextSmMuted>Stacked vertically with gap=2</TextSmMuted>
              </Stack>
            </Stack>
          </div>

          {/* Text */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Text — Named Size + Weight Variants
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ TextSm, TextSmMuted, TextBase, … }'} from @/components/ui/text
            </p>
            <p className="mb-3 text-xs text-accent-500">
              Canonical text components by size and weight. Each accepts a status prop for semantic
              color (default / muted / error / success / warning / info / primary).
            </p>
            <Stack
              gap={2}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <TextLg>TextLg — large paragraph</TextLg>
              <TextLgMuted>TextLgMuted — large, muted</TextLgMuted>
              <TextBase>TextBase — base paragraph</TextBase>
              <TextBaseMedium>TextBaseMedium — base, medium weight</TextBaseMedium>
              <TextBaseMuted>TextBaseMuted — base, muted</TextBaseMuted>
              <TextSm>TextSm — small paragraph</TextSm>
              <TextSmMedium>TextSmMedium — small, medium weight</TextSmMedium>
              <TextSmSemibold>TextSmSemibold — small, semibold</TextSmSemibold>
              <TextSmMuted>TextSmMuted — small, muted</TextSmMuted>
              <TextXs>TextXs — extra small</TextXs>
              <TextXsMedium>TextXsMedium — extra small, medium</TextXsMedium>
              <TextXsMuted>TextXsMuted — extra small, muted</TextXsMuted>
              <TextMuted>TextMuted — base size, muted color shortcut</TextMuted>
              <TextPrimary>TextPrimary — small, primary color</TextPrimary>
              <Caption>Caption — fixed surface color, no status prop</Caption>
              <TextSm status="error">TextSm with status=&quot;error&quot;</TextSm>
              <TextSm status="success">TextSm with status=&quot;success&quot;</TextSm>
              <TextSm status="warning">TextSm with status=&quot;warning&quot;</TextSm>
              <TextSm status="info">TextSm with status=&quot;info&quot;</TextSm>
            </Stack>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Heading — Named H1 / H1Hero / H2 / H3 / H4
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ H1, H1Hero, H2, H3, H4 }'} from @/components/ui/heading
            </p>
            <p className="mb-3 text-xs text-accent-500">
              Semantic headings — each name renders the matching tag with its canonical size and
              weight. H1Hero is the extra-bold display variant.
            </p>
            <Stack
              gap={3}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <H1Hero>H1Hero — hero display heading</H1Hero>
              <H1>H1 — primary heading</H1>
              <H2>H2 — secondary heading</H2>
              <H3>H3 — tertiary heading</H3>
              <H4>H4 — quaternary heading</H4>
              <H2 status="primary">H2 with status=&quot;primary&quot;</H2>
              <H3 status="error">H3 with status=&quot;error&quot;</H3>
            </Stack>
          </div>

          {/* Label */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Label — LabelSm
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ LabelSm }'} from @/components/ui/label
            </p>
            <p className="mb-3 text-xs text-accent-500">
              Small label-style text (text-xs font-medium tracking-wide). Use as=&quot;span&quot;
              for inline.
            </p>
            <Stack
              gap={2}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <LabelSm>LabelSm — default</LabelSm>
              <LabelSm status="primary">LabelSm — primary</LabelSm>
              <LabelSm status="success">LabelSm — success</LabelSm>
              <LabelSm status="error">LabelSm — error</LabelSm>
              <LabelSm status="warning">LabelSm — warning</LabelSm>
              <LabelSm status="info">LabelSm — info</LabelSm>
            </Stack>
          </div>

          {/* Code */}
          <div className="mb-8">
            <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
              Code
            </H3>
            <p className="mb-3 font-mono text-xs text-accent-400">
              import {'{ Code }'} from @/components/ui/code
            </p>
            <p className="mb-3 text-xs text-accent-500">
              Inline by default. Pass block for a pre-wrapped block.
            </p>
            <Stack
              gap={3}
              className="rounded-lg border border-accent-200 p-4 dark:border-accent-700"
            >
              <TextSm>
                Inline: call <Code>pnpm dev</Code> to start the dev server.
              </TextSm>
              <Code
                block
              >{`const greet = (name: string) => \`hello, \${name}\`\ngreet('trillium')`}</Code>
            </Stack>
          </div>
        </Section>

        {/* Biome exempt paths */}
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
      </div>
    </SectionContainer>
  )
}
