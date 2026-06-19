/* ds-ignore-file */ /* content-ok-file */
import { Box } from '@/components/ui/box'
import { Stack } from '@/components/ui/stack'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TextSm, TextSmMuted } from '@/components/ui/text'
import { H3 } from '@/components/ui/heading'
import { Section } from './shared'

export function LayoutComponents() {
  return (
    <Section title="Layout Components">
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

      <div className="mb-8">
        <H3 className="mb-1 text-sm font-semibold text-accent-700 dark:text-accent-300">Stack</H3>
        <p className="mb-3 font-mono text-xs text-accent-400">
          import {'{ Stack }'} from @/components/ui/stack
        </p>
        <p className="mb-3 text-xs text-accent-500">
          Flex layout primitive — direction, gap, align, justify, wrap props.
        </p>
        <Stack gap={4} className="rounded-lg border border-accent-200 p-4 dark:border-accent-700">
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
    </Section>
  )
}
