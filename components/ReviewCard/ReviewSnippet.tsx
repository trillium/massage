import { Star } from './Stars'
import type { ReviewSnippetProps } from '@/lib/types'

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
        <div className="text-primary-400 flex items-center gap-3">
          {Array.from({ length: rating || 0 }, (_, i) => (
            <Star key={i} size={30} />
          ))}
          {Array.from({ length: 5 - (rating || 0) }, (_, i) => (
            <Star key={i} fillNone size={30} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <h6 className="text-lg leading-8 font-semibold text-black capitalize dark:text-white">
            {displayName}
          </h6>
          {displayDate && <p className="text-base leading-7 font-medium text-gray-400">{date}</p>}
        </div>
      </div>

      <p className="text-lg leading-8 font-normal text-gray-800 dark:text-gray-400">{text}</p>
    </div>
  )
}
