import Image from './Image'
import Link from './Link'
import uiData from '@/data/ui.json'
import { H2 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Box } from '@/components/ui/box'

const Card = ({
  title,
  description,
  imgSrc,
  href,
}: {
  title: string
  description: string
  imgSrc?: string
  href?: string
}) => (
  <Box className="md max-w-[544px] p-4 md:w-1/2">
    <Box
      className={`${
        imgSrc && 'h-full'
      } overflow-hidden rounded-md border-2 border-accent-200/60 dark:border-accent-700/60`}
    >
      {imgSrc &&
        (href ? (
          <Link href={href} aria-label={`Link to ${title}`}>
            <Image
              alt={title}
              src={imgSrc}
              className="object-cover object-center md:h-36 lg:h-48"
              width={544}
              height={306}
            />
          </Link>
        ) : (
          <Image
            alt={title}
            src={imgSrc}
            className="object-cover object-center md:h-36 lg:h-48"
            width={544}
            height={306}
          />
        ))}
      <Box className="p-6">
        <H2 className="mb-3">
          {href ? (
            <Link href={href} aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </H2>
        <TextBase status="muted" className="prose mb-3 max-w-none">
          {description}
        </TextBase>
        {href && (
          <Link
            href={href}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-base leading-6 font-medium"
            aria-label={`Link to ${title}`}
          >
            {uiData.misc.learnMore}
          </Link>
        )}
      </Box>
    </Box>
  </Box>
)

export default Card
