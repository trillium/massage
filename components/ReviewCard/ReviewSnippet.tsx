import { Star } from './Stars'
import type { ReviewSnippetProps } from '@/lib/types'
import { TextBaseMedium, TextLgMuted } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { H6 } from '@/components/ui/heading'
import { Box } from '@/components/ui/box'

export const ReviewSnippet = ({
  text,
  firstName,
  lastName,
  name,
  date,
  displayDate = false,
  rating = 5,
}: ReviewSnippetProps) => {
  const displayName =
    name ||
    (!firstName && !lastName
      ? 'Anonymous'
      : !lastName
        ? firstName
        : firstName + ' ' + lastName[0] + '.') ||
    'Anonymous'

  return (
    <Box className="pt-4">
      <Stack direction="col" justify="between" className="mb-4 sm:flex-row sm:items-center">
        <Stack className="text-primary-400" direction="row" align="center" gap={3}>
          {Array.from({ length: rating || 0 }, (_, i) => (
            <Star key={i} size={30} />
          ))}
          {Array.from({ length: 5 - (rating || 0) }, (_, i) => (
            <Star key={i} fillNone size={30} />
          ))}
        </Stack>
        <Stack direction="row" align="center" gap={3}>
          <H6 className="text-lg leading-8 font-semibold text-accent-950 capitalize dark:text-white">
            {displayName}
          </H6>
          {displayDate && <TextBaseMedium status="muted">{date}</TextBaseMedium>}
        </Stack>
      </Stack>

      <TextLgMuted>{text}</TextLgMuted>
    </Box>
  )
}
