import Link from '@/components/Link'
import system from '@/data/system.json'
import SectionContainer from '@/components/SectionContainer'
import BookSessionButton from '@/components/BookSessionButton'
import { H1Hero, H2 } from '@/components/ui/heading'
import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export default function NotFound() {
  return (
    <SectionContainer>
      <Stack
        direction="col"
        align="center"
        justify="center"
        gap={6}
        className="py-16 text-center md:py-24"
      >
        {/* ds-ignore */}
        <H1Hero status="primary" className="text-7xl md:text-9xl">
          {system.notFound.code}
        </H1Hero>
        <Stack direction="col" align="center" gap={3} className="max-w-xl">
          <H2>{system.notFound.title}</H2>
          <TextBase status="muted">{system.notFound.description}</TextBase>
        </Stack>
        <Stack direction="col" align="center" gap={3} className="pt-2 sm:flex-row sm:gap-4">
          <BookSessionButton title={system.notFound.buttons.book} href="/book" />
          <Box>
            <Link
              href="/"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center text-base font-medium underline-offset-4 hover:underline"
            >
              {system.notFound.buttons.home}
            </Link>
          </Box>
        </Stack>
      </Stack>
    </SectionContainer>
  )
}
