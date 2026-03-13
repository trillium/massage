import Image from './Image'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import Link from '@/components/Link'
import { siteConfig } from '@/lib/siteConfig'

const { bio, focus, stats, rating, statsClose } = siteConfig.content.about

const AuthorCard = () => {
  const { author, avatar, occupation, company, email, location, instagram } = siteMetadata
  return (
    <div>
      <div className="flex flex-row items-center justify-center space-x-2 pb-2">
        {avatar && (
          <div className="pr-2 xl:pr-4">
            <Image
              src={avatar}
              alt="avatar"
              width={224}
              height={224}
              className="border-primary-400 h-48 w-48 min-w-48 rounded-full border-2 object-cover md:h-52 md:w-52"
            />
          </div>
        )}
        <div>
          <h3 className="pt-4 pb-2 text-2xl leading-8 font-bold tracking-tight sm:text-3xl md:text-4xl">
            {author}
          </h3>
          <div className="md:text-md text-base text-accent-500 dark:text-accent-400">
            {occupation}
          </div>
          <div className="md:text-md text-base text-accent-500 dark:text-accent-400">{company}</div>
          <div className="md:text-md text-base text-accent-500 dark:text-accent-400">
            {location}
          </div>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="instagram" href={instagram} />
          </div>
        </div>
      </div>
      <div className="flex max-w-full flex-col items-center justify-center">
        <div className="prose dark:prose-invert max-w-full pt-10 pb-8 xl:text-xl">
          <p className="py-2 text-justify">
            {bio} {focus} {stats}{' '}
            <Link
              className="text-primary-500 dark:text-primary-400 font-bold underline-offset-0 transition-transform duration-300 hover:scale-105 hover:underline"
              href={'/reviews'}
            >
              {rating}
            </Link>
            {statsClose}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthorCard
