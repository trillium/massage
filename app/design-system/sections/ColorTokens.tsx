/* ds-ignore-file */ /* content-ok-file */
import { Stack } from '@/components/ui/stack'
import { Section, Swatch } from './shared'

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

export function ColorTokens() {
  return (
    <Section title="Color Tokens">
      <div className="space-y-8">
        {PALETTES.map(({ name, label, description }) => (
          <div key={name}>
            <Stack direction="row" gap={3} className="mb-2 items-baseline">
              <span className="font-semibold text-accent-800 dark:text-accent-200">{label}</span>
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
  )
}
