import { Star } from './Stars'
import type { ReviewSnippetProps } from '@/lib/types'
import { TextBaseMedium, TextLgMuted } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'

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
    <div className="pt-4">
      <div className="mb-4 flex flex-col justify-between sm:flex-row sm:items-center">
        <Stack className="text-primary-400" direction="row" align="center" gap={3}>
          {Array.from({ length: rating || 0 }, (_, i) => (
            <Star key={i} size={30} />
          ))}
          {Array.from({ length: 5 - (rating || 0) }, (_, i) => (
            <Star key={i} fillNone size={30} />
          ))}
        </Stack>
        <Stack direction="row" align="center" gap={3}>
          <h6 className="text-lg leading-8 font-semibold text-accent-950 capitalize dark:text-white">
            {displayName}
          </h6>
          {displayDate && <TextBaseMedium status="muted">{date}</TextBaseMedium>}
        </Stack>
      </div>

      <TextLgMuted>{text}</TextLgMuted>
    </div>
  )
}
