/* ds-ignore-file */ /* content-ok-file */
import { H2 } from '@/components/ui/heading'
import { Stack } from '@/components/ui/stack'

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <H2 className="mb-6 text-xl font-bold tracking-tight text-accent-900 dark:text-accent-100">
        {title}
      </H2>
      {children}
    </section>
  )
}

export function Swatch({ palette, scale }: { palette: string; scale: number }) {
  return (
    <Stack direction="col" align="center" gap={1}>
      <div
        className={`h-10 w-10 rounded border border-accent-200 bg-${palette}-${scale} dark:border-accent-700`}
      />
      <span className="text-center font-mono text-[10px] text-accent-500">{scale}</span>
    </Stack>
  )
}
