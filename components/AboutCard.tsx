import Image from './Image'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import Link from '@/components/Link'
import { home } from '@/app/content'
import { H3 } from '@/components/ui/heading'

import { TextBase } from '@/components/ui/text'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

const { bio, focus, stats, rating, statsClose } = home.about

const AuthorCard = () => {
  const { author, avatar, occupation, company, email, location, instagram } = siteMetadata
  return (
    <Box>
      <Stack className="space-x-2 pb-2" direction="row" align="center" justify="center">
        {avatar && (
          <Box className="pr-2 xl:pr-4">
            <Image
              src={avatar}
              alt="avatar"
              width={224}
              height={224}
              className="border-primary-400 h-48 w-48 min-w-48 rounded-full border-2 object-cover md:h-52 md:w-52"
            />
          </Box>
        )}
        <Box>
          <H3 className="pt-4 pb-2 sm:text-3xl md:text-4xl">{author}</H3>
          <Box className="md:text-md text-base text-accent-500 dark:text-accent-400">
            {occupation}
          </Box>
          <Box className="md:text-md text-base text-accent-500 dark:text-accent-400">{company}</Box>
          <Box className="md:text-md text-base text-accent-500 dark:text-accent-400">
            {location}
          </Box>
          <Stack className="space-x-3 pt-6" direction="row">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="instagram" href={instagram} />
          </Stack>
        </Box>
      </Stack>
      <Stack className="max-w-full" direction="col" align="center" justify="center">
        <Box className="prose dark:prose-invert max-w-full pt-10 pb-8 xl:text-xl">
          <TextBase className="py-2 text-justify">
            {bio} {focus} {stats}{' '}
            <Link
              className="text-primary-500 dark:text-primary-400 font-bold underline-offset-0 transition-transform duration-300 hover:scale-105 hover:underline"
              href={'/reviews'}
            >
              {rating}
            </Link>
            {statsClose}
          </TextBase>
        </Box>
      </Stack>
    </Box>
  )
}

export default AuthorCard
