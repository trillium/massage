import Link from '@/components/Link'
import system from '@/data/system.json'
import { H1 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export default function NotFound() {
  return (
    <Stack
      direction="col"
      align="start"
      justify="start"
      className="md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6"
    >
      <Box className="space-x-2 pt-6 pb-8 md:space-y-5">
        <H1 className="text-6xl md:border-r-2 md:px-6 md:text-8xl md:leading-14">
          {' '}
          {/* ds-ignore */}
          {system.notFound.code}
        </H1>
      </Box>
      <Box className="max-w-md">
        <TextBase className="mb-4 text-xl leading-normal font-bold md:text-2xl">
          {' '}
          {/* ds-ignore */}
          {system.notFound.title}
        </TextBase>
        <TextBase className="mb-8">{system.notFound.description}</TextBase>
        <Link
          href="/"
          className="focus:shadow-outline-blue bg-primary-600 inline rounded-lg border border-transparent px-4 py-2 text-sm leading-5 font-medium text-white shadow-xs transition-colors duration-150 hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          {system.notFound.buttons.home}
        </Link>
      </Box>
    </Stack>
  )
}
