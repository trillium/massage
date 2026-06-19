/* ds-ignore-file */ /* content-ok-file */
import { Badge } from '@/components/ui/badge'
import { GradientText } from '@/components/ui/GradientText'
import { Stack } from '@/components/ui/stack'
import {
  TextBase,
  TextBaseMuted,
  TextBaseMedium,
  TextBaseSemibold,
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
import { H1, H1Hero, H2, H3, H4, H5, H6 } from '@/components/ui/heading'
import { LabelSm } from '@/components/ui/label'
import { Code } from '@/components/ui/code'
import { Section } from './shared'

export function TypographyComponents() {
  return (
    <Section title="Typography & Display Components">
      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Badge</H3>
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

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
          GradientText
        </H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ GradientText }'} from @/components/ui/GradientText
        </p>
        <p className="mb-3 text-xs text-accent-500">
          Gradient-clipped text span. Default: accent-700 → primary-700 → primary-500 (bottom). Used
          for hero headline emphasis words (Relax, Restore, Rejuvenate).
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
        <Stack gap={2} className="rounded-lg border border-accent-200 p-4 dark:border-accent-700">
          <TextLg>TextLg — large paragraph</TextLg>
          <TextLgMuted>TextLgMuted — large, muted</TextLgMuted>
          <TextBase>TextBase — base paragraph</TextBase>
          <TextBaseMedium>TextBaseMedium — base, medium weight</TextBaseMedium>
          <TextBaseSemibold>TextBaseSemibold — base, semibold</TextBaseSemibold>
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

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
          Heading — Named H1 / H1Hero / H2 / H3 / H4 / H5 / H6
        </H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ H1, H1Hero, H2, H3, H4, H5, H6 }'} from @/components/ui/heading
        </p>
        <p className="mb-3 text-xs text-accent-500">
          Semantic headings — each name renders the matching tag with its canonical size and weight.
          H1Hero is the extra-bold display variant.
        </p>
        <Stack gap={3} className="rounded-lg border border-accent-200 p-4 dark:border-accent-700">
          <H1Hero>H1Hero — hero display heading</H1Hero>
          <H1>H1 — primary heading</H1>
          <H2>H2 — secondary heading</H2>
          <H3>H3 — tertiary heading</H3>
          <H4>H4 — quaternary heading</H4>
          <H5>H5 — fifth-level heading</H5>
          <H6>H6 — sixth-level heading</H6>
          <H2 status="primary">H2 with status=&quot;primary&quot;</H2>
          <H3 status="error">H3 with status=&quot;error&quot;</H3>
        </Stack>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">
          Label — LabelSm
        </H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ LabelSm }'} from @/components/ui/label
        </p>
        <p className="mb-3 text-xs text-accent-500">
          Small label-style text (text-xs font-medium tracking-wide). Use as=&quot;span&quot; for
          inline.
        </p>
        <Stack gap={2} className="rounded-lg border border-accent-200 p-4 dark:border-accent-700">
          <LabelSm>LabelSm — default</LabelSm>
          <LabelSm status="primary">LabelSm — primary</LabelSm>
          <LabelSm status="success">LabelSm — success</LabelSm>
          <LabelSm status="error">LabelSm — error</LabelSm>
          <LabelSm status="warning">LabelSm — warning</LabelSm>
          <LabelSm status="info">LabelSm — info</LabelSm>
        </Stack>
      </div>

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Code</H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ Code }'} from @/components/ui/code
        </p>
        <p className="mb-3 text-xs text-accent-500">
          Inline by default. Pass block for a pre-wrapped block.
        </p>
        <Stack gap={3} className="rounded-lg border border-accent-200 p-4 dark:border-accent-700">
          <TextSm>
            Inline: call <Code>pnpm dev</Code> to start the dev server.
          </TextSm>
          <Code
            block
          >{`const greet = (name: string) => \`hello, \${name}\`\ngreet('trillium')`}</Code>
        </Stack>
      </div>
    </Section>
  )
}
