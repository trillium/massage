/* ds-ignore-file */ /* content-ok-file */
import { Stack } from '@/components/ui/stack'
import { Section } from './shared'

const TYPE_SCALE: Array<[string, string]> = [
  ['text-xs', 'Extra small — 12px'],
  ['text-sm', 'Small — 14px'],
  ['text-base', 'Base — 16px'],
  ['text-lg', 'Large — 18px'],
  ['text-xl', 'XL — 20px'],
  ['text-2xl', '2XL — 24px'],
  ['text-3xl', '3XL — 30px'],
  ['text-4xl', '4XL — 36px'],
  ['text-5xl', '5XL — 48px'],
]

export function TypographyScale() {
  return (
    <Section title="Typography Scale">
      <div className="space-y-3 rounded-lg border border-accent-200 p-6 dark:border-accent-700">
        {TYPE_SCALE.map(([cls, label]) => (
          <Stack direction="row" gap={4} className="items-baseline" key={cls}>
            <span className="w-24 font-mono text-xs text-accent-400">{cls}</span>
            <span className={`${cls} text-accent-900 dark:text-accent-100`}>{label}</span>
          </Stack>
        ))}
      </div>
    </Section>
  )
}
