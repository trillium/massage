import Link from '@/components/Link'
import eventContent from '@/data/event.json'
import { H1 } from '@/components/ui/heading'
import { TextLgMuted } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

export default function NotFound() {
  return (
    <Box className="container mx-auto px-4 py-8">
      <Box className="mx-auto max-w-2xl text-center">
        <H1 className="mb-4 dark:text-white">{eventContent.notFound.heading}</H1>
        <TextLgMuted className="mb-8">{eventContent.notFound.message}</TextLgMuted>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          {eventContent.notFound.homeLink}
        </Link>
      </Box>
    </Box>
  )
}
